/**
 * Componente PriceCalculator - Muestra el precio total del arreglo
 * 
 * Este componente calcula y muestra el precio total del arreglo personalizado,
 * actualizándose en tiempo real cuando cambia la selección de componentes.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 * Property 11: Cálculo de precio total
 * Property 12: Formato de moneda
 */

import { useArrangementStore } from '../../store/arrangement.store';
import './PriceCalculator.css';

/**
 * Formatea un número como precio en pesos colombianos
 * 
 * @param price - Precio a formatear
 * @returns Precio formateado con símbolo de moneda y separadores
 * 
 * Validates: Requirements 7.4
 * Property 12: Formato de moneda
 */
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Componente que muestra el precio total del arreglo personalizado
 * 
 * Obtiene el precio total del store usando getTotalPrice()
 * Formatea el precio con símbolo de moneda y separadores correctos
 * Se actualiza automáticamente cuando cambia la selección
 * Muestra precio cero cuando no hay base seleccionada
 * 
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5
 */
export const PriceCalculator = () => {
  const getTotalPrice = useArrangementStore((state) => state.getTotalPrice);
  const isValid = useArrangementStore((state) => state.isValid);

  const totalPrice = getTotalPrice();
  const hasBase = isValid();

  return (
    <div className="price-calculator">
      <div className="price-calculator__container">
        <div className="price-calculator__label">
          Precio Total
        </div>
        <div className="price-calculator__amount">
          {formatPrice(totalPrice)}
        </div>
        {!hasBase && totalPrice === 0 && (
          <div className="price-calculator__message">
            Selecciona una base para ver el precio
          </div>
        )}
      </div>
    </div>
  );
};
