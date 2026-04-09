import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const tokenWs = formData.get('token_ws') as string;
    
    // Si la compra fue anulada, Transbank envía TBK_TOKEN
    const tbkToken = formData.get('TBK_TOKEN') as string;
    const tbkOrdenCompra = formData.get('TBK_ORDEN_COMPRA') as string;
    
    const frontendUrl = Deno.env.get('FRONTEND_URL') ?? 'http://localhost:5173';

    // Manejo de pago anulado por el usuario
    if (tbkToken && !tokenWs) {
      console.log('[webpay-webhook] Pago anulado por el usuario (TBK_TOKEN presente)');
      return Response.redirect(`${frontendUrl}/checkout/failure?reason=cancelled`, 302);
    }

    if (!tokenWs) {
      console.error('[webpay-webhook] Falta token_ws');
      return Response.redirect(`${frontendUrl}/checkout/failure?reason=missing_token`, 302);
    }

    console.info(`[webpay-webhook] Confirming transaction with token: ${tokenWs}`);

    const commerceCode = Deno.env.get('WEBPAY_COMMERCE_CODE') || '597055555532';
    const apiKey = Deno.env.get('WEBPAY_API_KEY') || '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';
    const isProduction = Deno.env.get('WEBPAY_ENVIRONMENT') === 'produccion';
    const webpayUrl = isProduction
      ? `https://webpay3g.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/${tokenWs}`
      : `https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions/${tokenWs}`;

    // Commit de la transacción en Transbank via HTTP
    const commitRes = await fetch(webpayUrl, {
      method: 'PUT',
      headers: {
        'Tbk-Api-Key-Id': commerceCode,
        'Tbk-Api-Key-Secret': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!commitRes.ok) {
        const text = await commitRes.text();
        console.error('[webpay-webhook] Error confirming transaction in Webpay:', text);
        return Response.redirect(`${frontendUrl}/checkout/failure?reason=commit_failed`, 302);
    }

    const commitResponse = await commitRes.json();
    console.log('[webpay-webhook] Commit Response:', commitResponse);

    const isApproved = commitResponse.response_code === 0 && commitResponse.status === 'AUTHORIZED';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Recuperar la orden a partir de session_id (que es la external_reference o ID)
    // El frontend mandó SESSION_ORDERID al create
    const sessionId = commitResponse.session_id; // "SESSION_uuid-of-order"
    const orderId = sessionId.replace('SESSION_', '');

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('[webpay-webhook] Orden no encontrada para el pago:', orderId);
      return Response.redirect(`${frontendUrl}/checkout/failure?order_id=${orderId}&reason=not_found`, 302);
    }

    if (isApproved) {
      console.info(`[webpay-webhook] Pago aprobado para orden ${order.order_number}`);

      // Actualizar orden
      await supabase
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          payment_id: commitResponse.authorization_code,
        })
        .eq('id', orderId);

      // Descontar inventario
      if (!order.stock_updated) {
        for (const item of order.items) {
          const { error: stockError } = await supabase
            .from('product_variants')
            .update({
              stock: supabase.raw(`stock - ${item.quantity}`),
            })
            .eq('id', item.variant_id);

          if (stockError) console.error('[webpay-webhook] Error actualizando stock', stockError);
        }

        await supabase
          .from('orders')
          .update({ stock_updated: true })
          .eq('id', orderId);
      }
      
      return Response.redirect(`${frontendUrl}/checkout/${order.id}/thank-you`, 302);

    } else {
      console.warn(`[webpay-webhook] Pago fallido o rechazado para orden ${order.order_number}`);
      
      await supabase
        .from('orders')
        .update({
          status: 'failed',
          payment_id: commitResponse.authorization_code || 'REJECTED',
        })
        .eq('id', orderId);

      return Response.redirect(`${frontendUrl}/checkout/failure?order_id=${orderId}&reason=rejected`, 302);
    }

  } catch (error) {
    console.error('[webpay-webhook] Error inesperado:', error);
    const frontendUrl = Deno.env.get('FRONTEND_URL') ?? 'http://localhost:5173';
    return Response.redirect(`${frontendUrl}/checkout/failure?reason=error`, 302);
  }
});
