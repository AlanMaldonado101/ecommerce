/**
 * Hook para gestionar el proceso de checkout con Mercado Pago
 * 
 * Este hook proporciona funcionalidad para crear una preferencia de pago
 * en Mercado Pago y redirigir al usuario al Checkout Pro.
 * 
 * Requirements: 3.1, 5.1, 5.4
 */

import { useState } from 'react';
import { supabase } from '../supabase/client';

/**
 * Datos requeridos para crear un checkout
 */
export interface CheckoutData {
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

/**
 * Respuesta de la creación de preferencia
 */
interface CreatePreferenceResponse {
  orderId: string;
  preferenceId: string;
  initPoint: string;
}

/**
 * Valor de retorno del hook useCheckout
 */
export interface UseCheckoutReturn {
  createCheckout: (data: CheckoutData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook para gestionar el proceso de checkout
 * 
 * Proporciona funciones para:
 * - Crear preferencia de pago en Mercado Pago
 * - Redirigir al usuario al Checkout Pro
 * - Gestionar estados de carga y error
 * 
 * @returns Objeto con función createCheckout y estados isLoading y error
 * 
 * Validates: Requirements 3.1, 5.1, 5.4
 */
export function useCheckout(): UseCheckoutReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Crea una preferencia de pago y redirige a Mercado Pago
   * 
   * @param data - Datos del checkout (items, monto total, datos del comprador)
   * @throws Error si el usuario no está autenticado o si falla la creación
   * 
   * Validates: Requirements 3.1, 5.1, 5.4
   */
  const createCheckout = async (data: CheckoutData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Obtener sesión del usuario autenticado
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No estás autenticado. Por favor inicia sesión.');
      }

      // Llamar a la Edge Function create-preference
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-preference`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la preferencia de pago');
      }

      const result: CreatePreferenceResponse = await response.json();

      // Redirigir a Mercado Pago Checkout Pro
      window.location.href = result.initPoint;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al procesar el checkout';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCheckout,
    isLoading,
    error,
  };
}
