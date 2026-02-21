import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { MercadoPagoClient } from '../_shared/mercadopago-client.ts';
import { generateOrderNumber, validateOrderAmount } from '../_shared/utils.ts';

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

    const requestData: CreatePreferenceRequest = await req.json();
    const { items, totalAmount, buyerData } = requestData;

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
        payment_method: 'checkout_pro',
        buyer_data: buyerData,
      })
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // Create Mercado Pago preference
    const mpClient = new MercadoPagoClient(Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') ?? '');

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
        success: `${Deno.env.get('FRONTEND_URL')}/checkout/${order.id}/thank-you`,
        failure: `${Deno.env.get('FRONTEND_URL')}/checkout/failure`,
        pending: `${Deno.env.get('FRONTEND_URL')}/checkout/pending`,
      },
      auto_return: 'approved',
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`,
      statement_descriptor: 'Tiendita Jireh',
      external_reference: order.id,
    });

    // Update order with preference_id
    await supabaseClient
      .from('orders')
      .update({ preference_id: preference.id })
      .eq('id', order.id);

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
    console.error('Error creating preference:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Error creating preference',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
