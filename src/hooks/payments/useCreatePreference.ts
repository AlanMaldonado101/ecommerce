import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../supabase/client';
import toast from 'react-hot-toast';

interface CreatePreferenceInput {
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

interface CreatePreferenceResponse {
  orderId: string;
  preferenceId: string;
  initPoint: string;
}

async function createPreference(input: CreatePreferenceInput): Promise<CreatePreferenceResponse> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No estás autenticado');
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-preference`,
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
    throw new Error(error.error || 'Error al crear la preferencia de pago');
  }

  return response.json();
}

export const useCreatePreference = () => {
  return useMutation({
    mutationFn: createPreference,
    onError: (error: Error) => {
      toast.error(error.message, {
        position: 'bottom-right',
      });
    },
  });
};
