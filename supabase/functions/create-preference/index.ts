import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { MercadoPagoClient } from '../_shared/mercadopago-client.ts';
import { generateOrderNumberFromDB, validateOrderAmount, translateMercadoPagoError } from '../_shared/utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePreferenceRequest {
  items: Array<{
    variantId: string;
    quantity: number;
    price: number;
    name: string;
    image: string;
  }>;
  totalAmount: number;
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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ============================================================================
    // TASK 6.1: Estructura base - Autenticación con Supabase Auth
    // ============================================================================
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
      console.error('[create-preference] Unauthorized access attempt');
      return new Response(
        JSON.stringify({
          error: 'UNAUTHORIZED',
          message: 'Debes iniciar sesión para realizar una compra',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    console.info(`[create-preference] Processing checkout for user: ${user.id}`);

    const requestData: CreatePreferenceRequest = await req.json();
    const { items, totalAmount, buyerData } = requestData;

    // ============================================================================
    // TASK 6.2: Validación de datos de entrada
    // ============================================================================
    
    // Validate order amount matches items
    const mpItems = items.map((item) => ({
      quantity: item.quantity,
      unit_price: item.price,
    }));

    if (!validateOrderAmount(mpItems, totalAmount)) {
      const calculatedTotal = items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
      console.error(
        `[create-preference] Invalid amount - Expected: ${calculatedTotal}, Received: ${totalAmount}`
      );
      return new Response(
        JSON.stringify({
          error: 'INVALID_AMOUNT',
          message: 'El monto total no coincide con los items del carrito',
          expected: calculatedTotal,
          received: totalAmount,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Validate prices against database
    const priceErrors: PriceValidationError[] = [];
    for (const item of items) {
      const { data: variantData, error: variantError } = await supabaseClient
        .from('variants')
        .select('price')
        .eq('id', item.variantId)
        .single();

      if (variantError || !variantData) {
        console.error(`[create-preference] Variant not found: ${item.variantId}`);
        return new Response(
          JSON.stringify({
            error: 'INVALID_VARIANT',
            message: `Producto no encontrado: ${item.name}`,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      // Allow small floating point differences (< 1 peso)
      if (Math.abs(variantData.price - item.price) >= 1) {
        priceErrors.push({
          variantId: item.variantId,
          expectedPrice: variantData.price,
          receivedPrice: item.price,
        });
      }
    }

    if (priceErrors.length > 0) {
      console.error('[create-preference] Price validation failed:', priceErrors);
      return new Response(
        JSON.stringify({
          error: 'INVALID_PRICE',
          message: 'Los precios de los items no coinciden con la base de datos',
          details: priceErrors,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // ============================================================================
    // TASK 6.3: Validación de stock
    // ============================================================================
    const stockErrors: StockValidationError[] = [];
    
    for (const item of items) {
      const { data: variantData, error: variantError } = await supabaseClient
        .from('variants')
        .select('stock')
        .eq('id', item.variantId)
        .single();

      if (variantError || !variantData) {
        console.error(`[create-preference] Variant not found for stock check: ${item.variantId}`);
        return new Response(
          JSON.stringify({
            error: 'INVALID_VARIANT',
            message: `Producto no encontrado: ${item.name}`,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      if (variantData.stock < item.quantity) {
        stockErrors.push({
          variantId: item.variantId,
          productName: item.name,
          requested: item.quantity,
          available: variantData.stock,
        });
      }
    }

    if (stockErrors.length > 0) {
      console.warn('[create-preference] Insufficient stock:', stockErrors);
      return new Response(
        JSON.stringify({
          error: 'INSUFFICIENT_STOCK',
          message: 'Algunos productos no tienen stock suficiente',
          details: stockErrors,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // ============================================================================
    // TASK 6.4: Creación de orden pendiente
    // ============================================================================
    
    // Generate order number using database function
    const orderNumber = await generateOrderNumberFromDB(supabaseClient);
    console.info(`[create-preference] Generated order number: ${orderNumber}`);

    // Create order in database with status 'pending'
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
        payment_method: 'checkout_pro',
        buyer_data: buyerData,
        stock_updated: false,
      })
      .select()
      .single();

    if (orderError) {
      console.error('[create-preference] Error creating order:', orderError);
      return new Response(
        JSON.stringify({
          error: 'DATABASE_ERROR',
          message: 'Error al crear la orden',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.info(`[create-preference] Order created: ${order.id} (${orderNumber})`);

    // ============================================================================
    // TASK 6.5: Creación de preferencia en Mercado Pago
    // ============================================================================
    
    const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!mpAccessToken) {
      console.error('[create-preference] MERCADOPAGO_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({
          error: 'CONFIGURATION_ERROR',
          message: 'Las credenciales de pago no están configuradas',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    const mpClient = new MercadoPagoClient(mpAccessToken);
    const frontendUrl = Deno.env.get('FRONTEND_URL') ?? 'http://localhost:5173';

    const preference = await mpClient.createPreference({
      items: items.map((item) => ({
        id: item.variantId,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: 'CLP',
      })),
      payer: {
        name: buyerData.name,
        email: buyerData.email,
        phone: {
          area_code: '',
          number: buyerData.phone,
        },
        address: {
          street_name: buyerData.address.street,
          street_number: buyerData.address.number,
          zip_code: buyerData.address.zipCode,
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
      external_reference: order.id,
    });

    console.info(`[create-preference] Mercado Pago preference created: ${preference.id}`);

    // Update order with preference_id
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ preference_id: preference.id })
      .eq('id', order.id);

    if (updateError) {
      console.error('[create-preference] Error updating order with preference_id:', updateError);
      // Non-critical error, continue anyway
    }

    console.info(
      `[create-preference] Checkout completed successfully - Order: ${order.id}, Preference: ${preference.id}`
    );

    return new Response(
      JSON.stringify({
        orderId: order.id,
        preferenceId: preference.id,
        initPoint: preference.init_point,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    // ============================================================================
    // TASK 6.6: Manejo de errores y logging
    // ============================================================================
    console.error('[create-preference] Unexpected error:', error);
    console.error('[create-preference] Stack trace:', error.stack);

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const translatedMessage = translateMercadoPagoError(errorMessage);

    return new Response(
      JSON.stringify({
        error: 'PAYMENT_GATEWAY_ERROR',
        message: translatedMessage,
        details: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
