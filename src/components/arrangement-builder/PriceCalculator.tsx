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
import { formatPrice } from '../../helpers';



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

  const { base, flowers, balloons, extras } = useArrangementStore((state) => state.selectedComponents);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <span className="material-icons-outlined text-primary">receipt_long</span>
        <h3 className="font-bold text-slate-800">Resumen de tu Arreglo</h3>
      </div>

      <div className="flex flex-col gap-3 text-sm">
        {/* Base */}
        <div className="flex items-start justify-between">
          <span className="text-slate-500">
            {base ? `1x ${base.name}` : <span className="text-red-400 italic">Base pendiente...</span>}
          </span>
          <span className="font-medium text-slate-700">
            {base ? formatPrice(base.price) : formatPrice(0)}
          </span>
        </div>

        {/* Flores */}
        {flowers.length > 0 && (
          <div className="flex items-start justify-between">
            <span className="text-slate-500">{flowers.length}x Flores variadas</span>
            <span className="font-medium text-slate-700">
              {formatPrice(flowers.reduce((acc, f) => acc + f.price, 0))}
            </span>
          </div>
        )}

        {/* Globos */}
        {balloons.length > 0 && (
          <div className="flex items-start justify-between">
            <span className="text-slate-500">{balloons.length}x Festivos y Globos</span>
            <span className="font-medium text-slate-700">
              {formatPrice(balloons.reduce((acc, b) => acc + b.price, 0))}
            </span>
          </div>
        )}

        {/* Extras */}
        {extras.length > 0 && (
          <div className="flex items-start justify-between">
            <span className="text-slate-500">{extras.length}x Extras adicionales</span>
            <span className="font-medium text-slate-700">
              {formatPrice(extras.reduce((acc, e) => acc + e.price, 0))}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 rounded-lg bg-slate-50 p-4 ring-1 ring-slate-100">
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total</span>
            <span className="text-2xl font-black text-primary">{formatPrice(totalPrice)}</span>
          </div>
          {!hasBase && (
            <span className="text-xs font-medium text-red-500 animate-pulse">
              Falta seleccionar base
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
