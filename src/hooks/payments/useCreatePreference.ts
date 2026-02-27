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
  // Get the session explicitly to ensure the token is available
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No estás autenticado. Por favor inicia sesión.');
  }

  const supabaseUrl = import.meta.env.VITE_PROJECT_URL_SUPABASE;
  const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;

  const response = await fetch(
    `${supabaseUrl}/functions/v1/create-preference`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': supabaseKey,
      },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    let message = 'Error al crear la preferencia de pago';
    try {
      const errorData = await response.json();
      // Show the exact error details so we can diagnose
      message = errorData.details || errorData.message || errorData.error || message;
    } catch {
      // ignore parse error
    }
    throw new Error(`[${response.status}] ${message}`);
  }

  return response.json() as Promise<CreatePreferenceResponse>;
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
