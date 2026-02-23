/**
 * Hook para integración del constructor de arreglos con el carrito de compras
 * 
 * Este hook proporciona funcionalidad para agregar arreglos personalizados
 * al carrito, generando un identificador único de grupo y convirtiendo
 * la configuración en items del carrito con metadata de agrupación.
 * 
 * Requirements: 9.3, 9.4, 13.1, 13.2, 13.3
 */

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useCartStore } from '../store/cart.store';
import { useArrangementStore } from '../store/arrangement.store';
import type { ICartItem } from '../components/shared/CartItem';
import type { ComponentItem } from '../interfaces/arrangement.interface';

interface UseArrangementCartReturn {
  addArrangementToCart: () => Promise<void>;
  isAdding: boolean;
  error: string | null;
}

/**
 * Hook para agregar arreglos personalizados al carrito
 * 
 * Genera un arrangementGroupId único, convierte la configuración actual
 * en items del carrito con metadata de agrupación, y los agrega al store del carrito.
 * 
 * @returns Objeto con función addArrangementToCart, estado isAdding y error
 */
export function useArrangementCart(): UseArrangementCartReturn {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const selectedComponents = useArrangementStore(state => state.selectedComponents);
  const addItem = useCartStore(state => state.addItem);

  /**
   * Convierte un ComponentItem a ICartItem con metadata de arreglo
   * 
   * @param component - Componente a convertir
   * @param arrangementGroupId - ID único del grupo de arreglo
   * @returns Item del carrito con metadata de agrupación
   */
  const convertComponentToCartItem = (
    component: ComponentItem,
    arrangementGroupId: string
  ): ICartItem => {
    return {
      variantId: component.id, // Usamos el ID del componente como variantId
      productId: component.id,
      name: component.name,
      color: 'N/A', // Los componentes de arreglo no tienen color
      storage: 'N/A', // Los componentes de arreglo no tienen storage
      price: component.price,
      quantity: 1, // Siempre 1 para componentes de arreglo (Req 13.4)
      image: component.image,
      arrangementGroupId,
      isArrangementComponent: true,
      componentCategory: component.category,
    };
  };

  /**
   * Agrega el arreglo personalizado actual al carrito
   * 
   * Genera un arrangementGroupId único, convierte cada componente seleccionado
   * en un ICartItem con metadata de agrupación, y los agrega al carrito.
   * 
   * Validates: Requirements 9.3, 9.4, 13.1, 13.2, 13.3
   * Property 16: Agregar componentes al carrito
   * Property 22: Metadata de agrupación en items del carrito
   * Property 23: Cantidad fija de componentes en carrito
   */
  const addArrangementToCart = async (): Promise<void> => {
    setIsAdding(true);
    setError(null);

    try {
      // Generar ID único para el grupo de arreglo
      const arrangementGroupId = uuidv4();

      // Convertir componentes seleccionados a items del carrito
      const cartItems: ICartItem[] = [];

      // Agregar base (siempre debe existir si llegamos aquí)
      if (selectedComponents.base) {
        cartItems.push(
          convertComponentToCartItem(selectedComponents.base, arrangementGroupId)
        );
      }

      // Agregar flores
      selectedComponents.flowers.forEach(flower => {
        cartItems.push(
          convertComponentToCartItem(flower, arrangementGroupId)
        );
      });

      // Agregar globos
      selectedComponents.balloons.forEach(balloon => {
        cartItems.push(
          convertComponentToCartItem(balloon, arrangementGroupId)
        );
      });

      // Agregar extras
      selectedComponents.extras.forEach(extra => {
        cartItems.push(
          convertComponentToCartItem(extra, arrangementGroupId)
        );
      });

      // Agregar todos los items al carrito
      cartItems.forEach(item => {
        addItem(item);
      });

      setIsAdding(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar al carrito';
      setError(errorMessage);
      setIsAdding(false);
      throw err; // Re-lanzar para que el componente pueda manejarlo
    }
  };

  return {
    addArrangementToCart,
    isAdding,
    error,
  };
}
