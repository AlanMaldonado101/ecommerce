import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../supabase/client';

interface ProcessPaymentRequest {
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

interface ProcessPaymentResponse {
  orderId: string;
  preferenceId?: string;
  initPoint?: string;
  webpayToken?: string;
  webpayUrl?: string;
}

export const useProcessPayment = () => {
  return useMutation({
    mutationFn: async (data: ProcessPaymentRequest) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No authenticated session');
      }

      const { data: responseData, error } = await supabase.functions.invoke(
        'create-payment',
        {
          body: data,
        }
      );

      if (error) {
        // Log the full error context, which contains the raw JSON from the server on 400s
        console.error('Supabase function error:', error);
        if (error.context) {
          console.error('Error context:', JSON.stringify(error.context, null, 2));
        } else if (error instanceof Error && (error as any).body) {
           console.error('Error body:', await (error as any).body);
        }
        
        // Return the inner message if it exists, otherwise the top level message
        const messageToThrow = error.context?.message || error.message || 'Error procesando el pago';
        throw new Error(messageToThrow);
      }

      if (responseData?.error) {
        console.error('MercadoPago Verbose Error:', JSON.stringify(responseData, null, 2));
        throw new Error(responseData.message || 'Error procesando el pago');
      }

      return responseData as ProcessPaymentResponse;
    },
  });
};
