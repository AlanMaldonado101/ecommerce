/**
 * Mercado Pago Webhook Handler
 * 
 * Procesa notificaciones de pago de Mercado Pago y actualiza el estado de órdenes.
 * 
 * Flujo:
 * 1. Validar firma del webhook
 * 2. Consultar detalles del pago en Mercado Pago
 * 3. Actualizar estado de la orden
 * 4. Actualizar inventario si el pago fue aprobado
 * 5. Registrar transacción
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { MercadoPagoClient } from '../_shared/mercadopago-client.ts';

// Interfaces para el webhook
interface WebhookNotification {
  action: string; // "payment.created" | "payment.updated"
  api_version: string;
  data: {
    id: string; // payment_id
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: string;
  user_id: string;
}

interface OrderData {
  id: string;
  order_number: string;
  items: Array<{
    variant_id: string;
    quantity: number;
    unit_price: number;
    name: string;
    image: string;
  }>;
  status: string;
  stock_updated: boolean;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-request-id',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Obtener access token de Mercado Pago
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured');
    }

    // Parsear el body del webhook
    const body: WebhookNotification = await req.json();

    // Log webhook recibido con contenido completo (Requisito 15.2)
    console.log('[Webhook] Received notification:', {
      action: body.action,
      type: body.type,
      paymentId: body.data?.id,
      liveMode: body.live_mode,
      timestamp: new Date().toISOString(),
      fullBody: body, // Contenido completo para auditoría
    });

    // Extraer headers de firma
    const signature = req.headers.get('x-signature');
    const requestId = req.headers.get('x-request-id');

    if (!signature || !requestId) {
      console.error('[Webhook] Missing signature headers');
      return new Response(
        JSON.stringify({
          error: 'INVALID_WEBHOOK',
          message: 'Missing signature headers',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Validar firma del webhook
    const mpClient = new MercadoPagoClient(accessToken);
    const isValid = await mpClient.validateWebhookSignature(
      signature,
      requestId,
      body.data.id
    );

    if (!isValid) {
      console.error('[Webhook] Invalid signature');
      return new Response(
        JSON.stringify({
          error: 'INVALID_WEBHOOK',
          message: 'Invalid webhook signature',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('[Webhook] Signature validated successfully');

    // Consultar detalles del pago en Mercado Pago
    const paymentId = body.data.id;
    console.log(`[Webhook] Fetching payment details for payment_id: ${paymentId}`);
    
    const paymentDetails = await mpClient.getPayment(paymentId);
    
    console.log('[Webhook] Payment details:', {
      paymentId: paymentDetails.id,
      status: paymentDetails.status,
      statusDetail: paymentDetails.status_detail,
      amount: paymentDetails.transaction_amount,
      paymentMethod: paymentDetails.payment_method_id,
      externalReference: paymentDetails.external_reference,
    });

    // Verificar que tenemos external_reference (order_id)
    if (!paymentDetails.external_reference) {
      console.error('[Webhook] Payment has no external_reference');
      return new Response(
        JSON.stringify({
          error: 'INVALID_PAYMENT',
          message: 'Payment has no external_reference',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const orderId = paymentDetails.external_reference;

    // Inicializar cliente de Supabase con service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Consultar la orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('[Webhook] Order not found:', orderId, orderError);
      return new Response(
        JSON.stringify({
          error: 'ORDER_NOT_FOUND',
          message: `Order ${orderId} not found`,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    console.log(`[Webhook] Found order: ${order.order_number}`);

    // Determinar nuevo estado de la orden según payment status
    let newOrderStatus = order.status;
    const paymentStatus = paymentDetails.status;

    if (paymentStatus === 'approved') {
      newOrderStatus = 'paid';
    } else if (paymentStatus === 'rejected') {
      newOrderStatus = 'cancelled';
    } else if (paymentStatus === 'pending') {
      newOrderStatus = 'pending';
    }

    // Log cambio de estado con timestamp y motivo (Requisito 15.3)
    console.log(`[Webhook] [order_id: ${orderId}] Status change:`, {
      orderNumber: order.order_number,
      previousStatus: order.status,
      newStatus: newOrderStatus,
      reason: `Payment ${paymentStatus}`,
      timestamp: new Date().toISOString(),
    });

    // Preparar datos de actualización
    const updateData: any = {
      status: newOrderStatus,
      payment_id: paymentDetails.id,
    };

    // Si el pago fue aprobado, registrar datos adicionales
    if (paymentStatus === 'approved') {
      updateData.paid_at = new Date().toISOString();
      updateData.payment_method = paymentDetails.payment_method_id;
    }

    // Actualizar la orden
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (updateError) {
      console.error('[Webhook] Error updating order:', updateError);
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    console.log(`[Webhook] Order ${order.order_number} updated successfully`);

    // Actualizar inventario si el pago fue aprobado y no se ha actualizado antes
    if (paymentStatus === 'approved' && !order.stock_updated) {
      console.log('[Webhook] Updating inventory...');
      
      const orderData = order as OrderData;
      const items = orderData.items;

      // Actualizar stock de cada variante
      for (const item of items) {
        // Log actualización de stock con order_id y cantidad (Requisito 15.4)
        console.log(`[Webhook] [order_id: ${orderId}] Reducing stock:`, {
          variantId: item.variant_id,
          productName: item.name,
          quantity: item.quantity,
          orderNumber: order.order_number,
          timestamp: new Date().toISOString(),
        });
        
        const { data: variant, error: stockError } = await supabase
          .from('product_variants')
          .update({
            stock: supabase.raw(`stock - ${item.quantity}`),
          })
          .eq('id', item.variant_id)
          .gte('stock', item.quantity)
          .select('stock')
          .single();

        if (stockError) {
          console.error(`[Webhook] Error updating stock for variant ${item.variant_id}:`, stockError);
          // Registrar alerta pero no fallar el webhook
          console.warn(`[Webhook] ALERT: Failed to update stock for variant ${item.variant_id} in order ${order.order_number}`);
        } else if (!variant) {
          // Stock insuficiente o variante no encontrada
          console.warn(`[Webhook] ALERT: Insufficient stock or variant not found for ${item.variant_id} in order ${order.order_number}`);
        } else {
          console.log(`[Webhook] Stock updated for variant ${item.variant_id}. New stock: ${variant.stock}`);
          
          // Verificar si el stock resultó negativo
          if (variant.stock < 0) {
            console.error(`[Webhook] ALERT: Negative stock detected for variant ${item.variant_id}: ${variant.stock}`);
          }
        }
      }

      // Marcar orden como stock_updated para idempotencia
      const { error: flagError } = await supabase
        .from('orders')
        .update({ stock_updated: true })
        .eq('id', orderId);

      if (flagError) {
        console.error('[Webhook] Error marking order as stock_updated:', flagError);
      } else {
        console.log(`[Webhook] Order ${order.order_number} marked as stock_updated`);
      }
    } else if (order.stock_updated) {
      console.log('[Webhook] Stock already updated for this order (idempotency check)');
    }

    // Registrar transacción en payment_transactions
    console.log('[Webhook] Recording payment transaction...');
    
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        order_id: orderId,
        payment_id: paymentDetails.id,
        status: paymentDetails.status,
        status_detail: paymentDetails.status_detail,
        amount: paymentDetails.transaction_amount,
        payment_method_id: paymentDetails.payment_method_id,
        payment_type_id: paymentDetails.payment_type_id,
        response_data: paymentDetails, // Almacenar respuesta completa para auditoría
      });

    if (transactionError) {
      console.error('[Webhook] Error recording transaction:', transactionError);
      // No fallar el webhook por error en registro de transacción
      console.warn('[Webhook] Transaction recording failed but webhook processing continues');
    } else {
      console.log('[Webhook] Payment transaction recorded successfully');
    }

    // Log final de éxito con resumen completo
    console.info(`[Webhook] [order_id: ${orderId}] Webhook processed successfully:`, {
      orderNumber: order.order_number,
      paymentId: paymentDetails.id,
      paymentStatus: paymentDetails.status,
      orderStatus: newOrderStatus,
      stockUpdated: paymentStatus === 'approved' && !order.stock_updated,
      transactionRecorded: !transactionError,
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ 
        message: 'Webhook processed successfully',
        orderId: orderId,
        orderNumber: order.order_number,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    // Log error con stack trace completo y contexto (Requisito 15.5)
    console.error('[Webhook] Error processing webhook:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    
    return new Response(
      JSON.stringify({
        error: 'WEBHOOK_PROCESSING_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
