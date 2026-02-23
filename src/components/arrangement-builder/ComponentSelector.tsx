/**
 * ComponentSelector - Selector de componentes por categoría
 * 
 * Muestra un grid de componentes disponibles para una categoría específica,
 * permite seleccionar/deseleccionar componentes y muestra indicadores visuales
 * de los componentes seleccionados.
 * 
 * Requirements: 2.1, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 13.2
 */

import { ComponentItem, ComponentCategory } from '../../interfaces/arrangement.interface';
import { formatPrice } from '../../helpers';

interface Props {
  /** Categoría de componentes que se está mostrando */
  category: ComponentCategory;
  /** Lista de componentes disponibles para esta categoría */
  components: ComponentItem[];
  /** IDs de los componentes actualmente seleccionados */
  selectedIds: string[];
  /** Callback cuando se hace clic en un componente para seleccionar/deseleccionar */
  onToggle: (component: ComponentItem) => void;
}

/**
 * Componente que muestra un grid de componentes seleccionables
 * Diseño responsive: grid en desktop, lista en mobile
 */
export const ComponentSelector = ({
  category,
  components,
  selectedIds,
  onToggle,
}: Props) => {
  // Si no hay componentes, mostrar mensaje
  if (components.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="material-icons-outlined mb-3 text-5xl text-slate-300">
          inventory_2
        </span>
        <p className="text-slate-500">
          No hay {category.toLowerCase()} disponibles en este momento
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {components.map((component) => {
        const isSelected = selectedIds.includes(component.id);

        return (
          <button
            key={component.id}
            type="button"
            onClick={() => onToggle(component)}
            className={`group relative overflow-hidden rounded-xl border-2 bg-white p-3 text-left shadow-sm transition-all duration-300 hover:shadow-lg ${
              isSelected
                ? 'border-primary shadow-primary/20'
                : 'border-slate-200 hover:border-primary/50'
            }`}
          >
            {/* Indicador de selección */}
            {isSelected && (
              <div className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                <span className="material-icons-outlined text-sm">check</span>
              </div>
            )}

            {/* Imagen del componente */}
            <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-slate-100">
              {component.image ? (
                <img
                  src={component.image}
                  alt={component.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = '/logo-jireh.png';
                    e.currentTarget.className =
                      'h-full w-full object-contain p-4 opacity-20 transition-transform duration-300 group-hover:scale-110';
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-300">
                  <span className="material-icons-outlined text-3xl opacity-50">
                    image_not_supported
                  </span>
                </div>
              )}
            </div>

            {/* Nombre del componente */}
            <h3
              className={`mb-1 text-sm font-semibold transition-colors ${
                isSelected ? 'text-primary' : 'text-slate-800 group-hover:text-primary'
              }`}
            >
              {component.name}
            </h3>

            {/* Precio */}
            <p className="text-xs font-bold text-slate-600">
              {formatPrice(component.price)}
            </p>
          </button>
        );
      })}
    </div>
  );
};
