import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { MercadoPagoClient } from '../_shared/mercadopago-client.ts';
import { generateOrderNumberFromDB, validateOrderAmount, translateMercadoPagoError } from '../_shared/utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePaymentRequest {
  items: Array<{
    variantId: string;
    quantity: number;
    price: number;
    name: string;
    image: string;
  }>;
  totalAmount: number;
  paymentMethod: 'webpay' | 'checkout_pro';
  buyerData: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      number: string;
      zipCode: string;
      city: string;
      state: string;
    };
  };
}

interface StockValidationError {
  variantId: string;
  productName: string;
  requested: number;
  available: number;
}

interface PriceValidationError {
  variantId: string;
  expectedPrice: number;
  receivedPrice: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      console.error('[create-payment] Unauthorized access attempt');
      return new Response(
        JSON.stringify({
          error: 'UNAUTHORIZED',
          message: 'Debes iniciar sesión para realizar una compra',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    console.info(`[create-payment] Processing checkout for user: ${user.id}`);

    const requestData: CreatePaymentRequest = await req.json();
    const { items, totalAmount, buyerData, paymentMethod } = requestData;

    // 1. Validation
    const mpItems = items.map((item) => ({ quantity: item.quantity, unit_price: item.price }));

    if (!validateOrderAmount(mpItems, totalAmount)) {
      const calculatedTotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
      return new Response(
        JSON.stringify({
          error: 'INVALID_AMOUNT',
          message: 'El monto total no coincide con los items del carrito',
          expected: calculatedTotal,
          received: totalAmount,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const priceErrors: PriceValidationError[] = [];
    for (const item of items) {
      const { data: variantData, error: variantError } = await supabaseClient
        .from('variants')
        .select('price')
        .eq('id', item.variantId)
        .single();

      if (variantError || !variantData) {
        return new Response(
          JSON.stringify({ error: 'INVALID_VARIANT', message: `Producto no encontrado: ${item.name}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      if (Math.abs(variantData.price - item.price) >= 1) {
        priceErrors.push({ variantId: item.variantId, expectedPrice: variantData.price, receivedPrice: item.price });
      }
    }

    if (priceErrors.length > 0) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PRICE', message: 'Los precios no coinciden con la BD', details: priceErrors }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const stockErrors: StockValidationError[] = [];
    for (const item of items) {
      const { data: variantData, error: variantError } = await supabaseClient
        .from('variants')
        .select('stock')
        .eq('id', item.variantId)
        .single();

      if (variantError || !variantData) {
        return new Response(
          JSON.stringify({ error: 'INVALID_VARIANT', message: `Producto no encontrado: ${item.name}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      if (variantData.stock < item.quantity) {
        stockErrors.push({ variantId: item.variantId, productName: item.name, requested: item.quantity, available: variantData.stock });
      }
    }

    if (stockErrors.length > 0) {
      return new Response(
        JSON.stringify({ error: 'INSUFFICIENT_STOCK', message: 'Insuficiente stock', details: stockErrors }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 2. Order Creation
    const orderNumber = await generateOrderNumberFromDB(supabaseClient);
    
    // Add paymentMethod to order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        order_number: orderNumber,
        buyer_id: user.id,
        items: items.map((item) => ({
          variant_id: item.variantId,
          quantity: item.quantity,
          unit_price: item.price,
          name: item.name,
          image: item.image,
        })),
        total_amount: totalAmount,
        currency: 'CLP',
        status: 'pending',
        payment_method: paymentMethod,
        buyer_data: buyerData,
        stock_updated: false,
      })
      .select()
      .single();

    if (orderError) {
      console.error('[create-payment] Error creating order:', orderError);
      return new Response(
        JSON.stringify({ error: 'DATABASE_ERROR', message: 'Error al crear la orden' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // 3. Gateway Routing depending on Payment Method
    const frontendUrl = Deno.env.get('FRONTEND_URL') ?? 'http://localhost:5173';

    if (paymentMethod === 'webpay') {
      console.info(`[create-payment] Webpay initializing for order ${order.id}`);
      const returnUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/webpay-webhook`;
      const sessionId = `SESSION_${order.id.split('-')[0]}`;
      const tbkOrderNumber = orderNumber.substring(0, 26);

      const commerceCode = Deno.env.get('WEBPAY_COMMERCE_CODE') || '597055555532';
      const apiKey = Deno.env.get('WEBPAY_API_KEY') || '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';
      const isProduction = Deno.env.get('WEBPAY_ENVIRONMENT') === 'produccion';
      const webpayUrl = isProduction
        ? 'https://webpay3g.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions'
        : 'https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions';

      // 1. Crear Transaccion en Webpay API REST
      const tbkRes = await fetch(webpayUrl, {
        method: 'POST',
        headers: {
          'Tbk-Api-Key-Id': commerceCode,
          'Tbk-Api-Key-Secret': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buy_order: tbkOrderNumber,
          session_id: sessionId,
          amount: totalAmount,
          return_url: returnUrl,
        }),
      });

      if (!tbkRes.ok) {
        const errText = await tbkRes.text();
        console.error('[create-payment] Webpay Create Error:', errText);
        throw new Error('No se pudo inicializar la transacción con Webpay.');
      }

      const tbkData = await tbkRes.json();

      return new Response(
        JSON.stringify({
          orderId: order.id,
          webpayToken: tbkData.token,
          webpayUrl: tbkData.url,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );

    } else if (paymentMethod === 'checkout_pro') {
      const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
      if (!mpAccessToken) {
        return new Response(
          JSON.stringify({ error: 'CONFIGURATION_ERROR', message: 'Las credenciales de pago no están configuradas' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      const mpClient = new MercadoPagoClient(mpAccessToken);
      const preference = await mpClient.createPreference({
        items: items.map((item) => ({
          id: item.variantId,
          title: item.name,
          quantity: Number(item.quantity),
          unit_price: Number(item.price),
          currency_id: 'CLP',
        })),
        payer: {
          name: buyerData.name,
          email: buyerData.email,
          phone: { area_code: '', number: buyerData.phone },
          address: { 
            street_name: buyerData.address.street, 
            street_number: buyerData.address.number || 'S/N', 
            zip_code: buyerData.address.zipCode || ''
          },
        },
        back_urls: {
          success: `${frontendUrl}/checkout/${order.id}/thank-you`,
          failure: `${frontendUrl}/checkout/failure?order_id=${order.id}`,
          pending: `${frontendUrl}/checkout/pending?order_id=${order.id}`,
        },
        auto_return: 'approved',
        notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`,
        statement_descriptor: 'Tiendita Jireh',
        external_reference: String(order.id),
      });

      const { error: updateError } = await supabaseClient
        .from('orders')
        .update({ preference_id: preference.id })
        .eq('id', order.id);

      return new Response(
        JSON.stringify({
          orderId: order.id,
          preferenceId: preference.id,
          initPoint: preference.init_point,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

  } catch (error) {
    console.error('[create-payment] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    const translatedMessage = translateMercadoPagoError(errorMessage);

    return new Response(
      JSON.stringify({
        error: 'PAYMENT_GATEWAY_ERROR',
        message: translatedMessage,
        details: errorMessage,
        raw: error
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
