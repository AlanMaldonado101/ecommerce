/**
 * Componente ConfigurationActions
 * 
 * Proporciona botones de acción para el constructor de arreglos:
 * - Botón "REINICIAR DISEÑO" con confirmación
 * - Botón "Agregar al Carrito" (deshabilitado si no hay base)
 * 
 * Requirements: 8.1, 8.2, 8.3, 9.1, 9.2, 9.3, 9.4, 9.5, 10.2, 10.4, 11.3
 */

import { useArrangementStore } from '../../store/arrangement.store';
import { useArrangementConfig } from '../../hooks/useArrangementConfig';
import { useArrangementCart } from '../../hooks/useArrangementCart';
import toast from 'react-hot-toast';

/**
 * Componente de acciones de configuración
 * 
 * Proporciona botones para reiniciar el diseño y agregar al carrito
 */
export const ConfigurationActions = () => {
  const { resetConfiguration, isValid } = useArrangementStore();
  const { clearConfig } = useArrangementConfig();
  const { addArrangementToCart, isAdding } = useArrangementCart();

  /**
   * Maneja el reinicio del diseño
   * Solicita confirmación antes de limpiar la configuración
   * 
   * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 11.4
   * Property 13: Reinicio limpia configuración
   * Property 19: Limpieza de localStorage al reiniciar
   */
  const handleReset = () => {
    // Solicitar confirmación al usuario
    const confirmed = window.confirm(
      '¿Estás seguro de que deseas reiniciar el diseño? Se perderán todos los componentes seleccionados.'
    );

    if (confirmed) {
      // Limpiar configuración del store
      resetConfiguration();
      
      // Limpiar configuración de localStorage
      clearConfig();

      toast.success('Diseño reiniciado correctamente', {
        position: 'bottom-right',
      });
    }
  };

  /**
   * Maneja la adición del arreglo al carrito
   * Valida que haya base seleccionada antes de agregar
   * 
   * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 10.2, 10.4, 11.3
   * Property 15: Error al agregar sin base
   * Property 16: Agregar componentes al carrito
   * Property 17: Limpieza tras agregar al carrito
   */
  const handleAddToCart = async () => {
    // Validar que haya base seleccionada
    if (!isValid()) {
      toast.error('Debes seleccionar una base antes de agregar al carrito', {
        position: 'bottom-right',
        duration: 4000,
      });
      return;
    }

    try {
      // Agregar arreglo al carrito
      await addArrangementToCart();

      // Limpiar configuración del store
      resetConfiguration();
      
      // Limpiar configuración de localStorage
      clearConfig();

      toast.success('¡Arreglo agregado al carrito exitosamente!', {
        position: 'bottom-right',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      toast.error('Error al agregar al carrito. Por favor, intenta de nuevo.', {
        position: 'bottom-right',
      });
    }
  };

  const configIsValid = isValid();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
      {/* Botón Reiniciar Diseño */}
      <button
        onClick={handleReset}
        className="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100"
        type="button"
      >
        REINICIAR DISEÑO
      </button>

      {/* Botón Agregar al Carrito */}
      <button
        onClick={handleAddToCart}
        disabled={!configIsValid || isAdding}
        className={`rounded-lg px-6 py-3 font-semibold text-white transition-colors ${
          configIsValid && !isAdding
            ? 'bg-pink-600 hover:bg-pink-700 active:bg-pink-800'
            : 'cursor-not-allowed bg-gray-300 text-gray-500'
        }`}
        type="button"
        title={!configIsValid ? 'Selecciona una base para continuar' : 'Agregar arreglo al carrito'}
      >
        {isAdding ? 'Agregando...' : 'Agregar al Carrito'}
      </button>
    </div>
  );
};
