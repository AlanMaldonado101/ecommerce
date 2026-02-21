import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { MercadoPagoClient } from '../_shared/mercadopago-client.ts';
import { generateOrderNumber, validateOrderAmount, translateMercadoPagoError } from '../_shared/utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessPaymentRequest {
  token: string;
  paymentMethodId: string;
  issuerId: string;
  installments: number;
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
    identification: {
      type: string;
      number: string;
    };
    address: {
      street: string;
      number: string;
      zipCode: string;
      city: string;
      state: string;
    };
  };
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
      throw new Error('Unauthorized');
    }

    const requestData: ProcessPaymentRequest = await req.json();
    const { token, paymentMethodId, issuerId, installments, items, totalAmount, buyerData } = requestData;

    // Validate order amount
    const mpItems = items.map((item) => ({
      quantity: item.quantity,
      unit_price: item.price,
    }));

    if (!validateOrderAmount(mpItems, totalAmount)) {
      throw new Error('Invalid order amount');
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order in database
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
        payment_method: 'checkout_api',
        buyer_data: buyerData,
      })
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // Process payment with Mercado Pago
    const mpClient = new MercadoPagoClient(Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') ?? '');

    const payment = await mpClient.createPayment({
      token,
      transaction_amount: totalAmount,
      installments,
      payment_method_id: paymentMethodId,
      issuer_id: issuerId,
      payer: {
        email: buyerData.email,
        identification: {
          type: buyerData.identification.type,
          number: buyerData.identification.number,
        },
      },
      description: `Orden ${orderNumber}`,
      external_reference: order.id,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`,
      statement_descriptor: 'Tiendita Jireh',
    });

    // Create payment transaction record
    await supabaseClient.from('payment_transactions').insert({
      order_id: order.id,
      payment_id: payment.id,
      status: payment.status,
      amount: totalAmount,
      payment_method_id: payment.payment_method_id,
      payment_type_id: payment.payment_type_id,
      status_detail: payment.status_detail,
      response_data: payment,
    });

    // Update order status based on payment status
    if (payment.status === 'approved') {
      await supabaseClient
        .from('orders')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', order.id);
    } else if (payment.status === 'rejected') {
      await supabaseClient
        .from('orders')
        .update({ status: 'failed' })
        .eq('id', order.id);
    }

    return new Response(
      JSON.stringify({
        orderId: order.id,
        paymentId: payment.id,
        status: payment.status,
        statusDetail: payment.status_detail,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing payment:', error);
    return new Response(
      JSON.stringify({
        error: translateMercadoPagoError(error.message || 'Error processing payment'),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
