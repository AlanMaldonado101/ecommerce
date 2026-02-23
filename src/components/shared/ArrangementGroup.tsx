/**
 * Componente ArrangementGroup
 * 
 * Muestra un grupo de componentes que pertenecen al mismo arreglo personalizado
 * Agrupa visualmente los items y muestra el subtotal del arreglo
 * 
 * Requirements: 13.5
 */

import { formatPrice } from '../../helpers';
import { useCartStore } from '../../store/cart.store';
import type { ICartItem } from './CartItem';

interface Props {
  items: ICartItem[];
}

/**
 * Componente que agrupa y muestra items de un arreglo personalizado
 * 
 * Validates: Requirements 13.5
 */
export const ArrangementGroup = ({ items }: Props) => {
  const removeItem = useCartStore(state => state.removeItem);

  // Calcular subtotal del arreglo
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Mapeo de categorías a emojis
  const categoryEmoji = {
    BASE: '📦',
    FLORES: '🌸',
    GLOBOS: '🎈',
    EXTRAS: '✨',
  };

  /**
   * Elimina todos los items del arreglo
   */
  const handleRemoveArrangement = () => {
    const confirmed = window.confirm(
      '¿Estás seguro de que deseas eliminar este arreglo completo del carrito?'
    );

    if (confirmed) {
      items.forEach(item => {
        removeItem(item.variantId);
      });
    }
  };

  return (
    <li className='border-2 border-pink-200 rounded-lg p-4 bg-pink-50/30'>
      {/* Encabezado del arreglo */}
      <div className='flex justify-between items-center mb-3 pb-2 border-b border-pink-200'>
        <h3 className='font-semibold text-pink-900 flex items-center gap-2'>
          🌸 Arreglo Personalizado
        </h3>
        <button
          onClick={handleRemoveArrangement}
          className='text-xs text-red-600 hover:text-red-800 underline font-medium'
        >
          Eliminar arreglo
        </button>
      </div>

      {/* Lista de componentes del arreglo */}
      <ul className='space-y-2 mb-3'>
        {items.map(item => {
          const emoji = item.componentCategory ? categoryEmoji[item.componentCategory] : '•';
          
          return (
            <li key={item.variantId} className='flex items-center gap-3 text-sm'>
              <div className='flex items-center gap-2 flex-1'>
                <img
                  src={item.image}
                  alt={item.name}
                  className='w-12 h-12 object-contain rounded'
                />
                <div className='flex-1'>
                  <p className='font-medium text-gray-800'>
                    {emoji} {item.componentCategory}: {item.name}
                  </p>
                </div>
              </div>
              <p className='text-gray-600 font-medium'>
                {formatPrice(item.price)}
              </p>
            </li>
          );
        })}
      </ul>

      {/* Subtotal del arreglo */}
      <div className='flex justify-between items-center pt-2 border-t border-pink-200'>
        <p className='font-semibold text-pink-900'>Total del arreglo:</p>
        <p className='font-bold text-pink-900 text-lg'>
          {formatPrice(subtotal)}
        </p>
      </div>
    </li>
  );
};
