import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!stripeKey || !webhookSecret) {
        console.error('[stripe-webhook] Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET');
        return new Response('Configuration error', { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Verify Stripe signature
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
        console.error('[stripe-webhook] Missing stripe-signature header');
        return new Response('Missing signature', { status: 400 });
    }

    let event: Stripe.Event;
    try {
        const body = await req.text();
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
        console.error('[stripe-webhook] Invalid signature:', err);
        return new Response('Invalid signature', { status: 400 });
    }

    // Use service role key to bypass RLS for order updates
    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.info(`[stripe-webhook] Event received: ${event.type}`);

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.metadata?.order_id;

            if (!orderId) {
                console.error('[stripe-webhook] No order_id in session metadata');
                return new Response('Missing order_id', { status: 400 });
            }

            // Fetch the order to get items for stock update
            const { data: order, error: fetchErr } = await supabaseAdmin
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

            if (fetchErr || !order) {
                console.error('[stripe-webhook] Order not found:', orderId, fetchErr);
                return new Response('Order not found', { status: 404 });
            }

            // Update order status to paid
            const { error: updateErr } = await supabaseAdmin
                .from('orders')
                .update({
                    status: 'paid',
                    payment_id: session.payment_intent as string,
                    stock_updated: false,
                })
                .eq('id', orderId);

            if (updateErr) {
                console.error('[stripe-webhook] Error updating order status:', updateErr);
                return new Response('DB update error', { status: 500 });
            }

            // Decrement stock for each item
            if (!order.stock_updated && Array.isArray(order.items)) {
                for (const item of order.items) {
                    const { error: stockErr } = await supabaseAdmin.rpc('decrement_stock', {
                        p_variant_id: item.variant_id,
                        p_quantity: item.quantity,
                    });

                    if (stockErr) {
                        console.error(`[stripe-webhook] Stock update error for variant ${item.variant_id}:`, stockErr);
                        // Non-blocking: continue updating other items
                    }
                }

                await supabaseAdmin
                    .from('orders')
                    .update({ stock_updated: true })
                    .eq('id', orderId);
            }

            console.info(`[stripe-webhook] Order ${orderId} marked as paid`);

        } else if (event.type === 'checkout.session.expired') {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.metadata?.order_id;

            if (orderId) {
                await supabaseAdmin
                    .from('orders')
                    .update({ status: 'cancelled' })
                    .eq('id', orderId)
                    .eq('status', 'pending'); // Only cancel if still pending

                console.info(`[stripe-webhook] Order ${orderId} marked as cancelled (session expired)`);
            }
        } else {
            console.info(`[stripe-webhook] Unhandled event type: ${event.type}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error('[stripe-webhook] Handler error:', error);
        return new Response('Internal error', { status: 500 });
    }
});
