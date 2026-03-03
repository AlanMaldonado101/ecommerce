import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { generateOrderNumberFromDB, validateOrderAmount } from '../_shared/utils.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutItem {
    variantId: string;
    quantity: number;
    price: number;
    name: string;
    image: string;
}

interface StripeCheckoutRequest {
    items: CheckoutItem[];
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
        // ── Auth ──────────────────────────────────────────────────────────────────
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            return new Response(
                JSON.stringify({ error: 'UNAUTHORIZED', message: 'Debes iniciar sesión para realizar una compra' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
            );
        }

        const { items, totalAmount, buyerData }: StripeCheckoutRequest = await req.json();

        // ── Validate total amount ─────────────────────────────────────────────────
        const mappedItems = items.map((i) => ({ quantity: i.quantity, unit_price: i.price }));
        if (!validateOrderAmount(mappedItems, totalAmount)) {
            return new Response(
                JSON.stringify({ error: 'INVALID_AMOUNT', message: 'El monto total no coincide con los items del carrito' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
        }

        // ── Validate prices & stock against DB ────────────────────────────────────
        for (const item of items) {
            const { data: variant, error: vErr } = await supabaseClient
                .from('variants')
                .select('price, stock')
                .eq('id', item.variantId)
                .single();

            if (vErr || !variant) {
                return new Response(
                    JSON.stringify({ error: 'INVALID_VARIANT', message: `Producto no encontrado: ${item.name}` }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
                );
            }

            if (Math.abs(variant.price - item.price) >= 1) {
                return new Response(
                    JSON.stringify({ error: 'INVALID_PRICE', message: `El precio de "${item.name}" ha cambiado. Recarga la página.` }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
                );
            }

            if (variant.stock < item.quantity) {
                return new Response(
                    JSON.stringify({ error: 'INSUFFICIENT_STOCK', message: `Stock insuficiente para "${item.name}". Disponible: ${variant.stock}` }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
                );
            }
        }

        // ── Create pending order in DB ────────────────────────────────────────────
        const orderNumber = await generateOrderNumberFromDB(supabaseClient);

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
                payment_method: 'stripe',
                buyer_data: buyerData,
                stock_updated: false,
            })
            .select()
            .single();

        if (orderError || !order) {
            console.error('[stripe-checkout] Error creating order:', JSON.stringify(orderError));
            return new Response(
                JSON.stringify({ error: 'DATABASE_ERROR', message: `Error al crear la orden: ${orderError?.message} | code: ${orderError?.code} | details: ${orderError?.details}` }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
        }

        // ── Create Stripe Checkout Session ───────────────────────────────────────
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (!stripeKey) {
            return new Response(
                JSON.stringify({ error: 'CONFIGURATION_ERROR', message: 'Credenciales de pago no configuradas' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
        }

        const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
        const frontendUrl = Deno.env.get('FRONTEND_URL') ?? 'http://localhost:5173';

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            customer_email: buyerData.email,
            payment_method_types: ['card'],
            line_items: items.map((item) => ({
                price_data: {
                    currency: 'clp',
                    product_data: {
                        name: item.name,
                        // Note: images require verified HTTPS URLs - omitted for compatibility
                    },
                    // CLP is a zero-decimal currency in Stripe — amount is in whole pesos
                    unit_amount: Math.round(item.price),
                },
                quantity: item.quantity,
            })),
            success_url: `${frontendUrl}/checkout/${order.id}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/checkout/cancel?order_id=${order.id}`,
            metadata: {
                order_id: order.id,
                order_number: orderNumber,
                user_id: user.id,
            },
            payment_intent_data: {
                metadata: {
                    order_id: order.id,
                },
            },
        });

        // ── Save stripe_session_id to order ──────────────────────────────────────
        await supabaseClient
            .from('orders')
            .update({ preference_id: session.id })   // reusing preference_id column for stripe session id
            .eq('id', order.id);

        console.info(`[stripe-checkout] Session created: ${session.id} for order ${order.id}`);

        return new Response(
            JSON.stringify({ orderId: order.id, sessionId: session.id, checkoutUrl: session.url }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error('[stripe-checkout] Unexpected error:', errMsg);
        return new Response(
            JSON.stringify({ error: 'PAYMENT_GATEWAY_ERROR', message: `Stripe error: ${errMsg}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
    }
});
