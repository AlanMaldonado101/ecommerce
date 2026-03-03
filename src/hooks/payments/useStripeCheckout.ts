import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../supabase/client';
import toast from 'react-hot-toast';

interface StripeCheckoutItem {
    variantId: string;
    quantity: number;
    price: number;
    name: string;
    image: string;
}

interface StripeCheckoutInput {
    items: StripeCheckoutItem[];
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

interface StripeCheckoutResponse {
    orderId: string;
    sessionId: string;
    checkoutUrl: string;
}

async function createStripeCheckout(input: StripeCheckoutInput): Promise<StripeCheckoutResponse> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        throw new Error('No estás autenticado. Por favor inicia sesión.');
    }

    const supabaseUrl = import.meta.env.VITE_PROJECT_URL_SUPABASE;
    const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': supabaseKey,
        },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        let message = 'Error al iniciar el pago';
        try {
            const errorData = await response.json();
            message = errorData.message || errorData.error || message;
        } catch {
            // ignore parse error
        }
        throw new Error(message);
    }

    return response.json() as Promise<StripeCheckoutResponse>;
}

export const useStripeCheckout = () => {
    return useMutation({
        mutationFn: createStripeCheckout,
        onError: (error: Error) => {
            toast.error(error.message, { position: 'bottom-right' });
        },
    });
};
