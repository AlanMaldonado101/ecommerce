import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../supabase/client';
import toast from 'react-hot-toast';

interface ProcessPaymentInput {
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

interface ProcessPaymentResponse {
  orderId: string;
  paymentId: string;
  status: string;
  statusDetail: string;
}

async function processPayment(input: ProcessPaymentInput): Promise<ProcessPaymentResponse> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No estás autenticado');
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-payment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al procesar el pago');
  }

  return response.json();
}

export const useProcessPayment = () => {
  return useMutation({
    mutationFn: processPayment,
    onError: (error: Error) => {
      toast.error(error.message, {
        position: 'bottom-right',
      });
    },
  });
};
