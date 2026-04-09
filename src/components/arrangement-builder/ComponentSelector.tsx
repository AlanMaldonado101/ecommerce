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
            className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border-2 bg-white text-left transition-all duration-300 ${
              isSelected
                ? 'border-primary shadow-lg shadow-primary/20 ring-1 ring-primary/50'
                : 'border-transparent shadow-sm hover:-translate-y-1 hover:border-primary/30 hover:shadow-md'
            }`}
          >
            {/* Imagen del componente */}
            <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
              {component.image ? (
                <img
                  src={component.image}
                  alt={component.name}
                  className={`h-full w-full object-cover transition-transform duration-500 ${
                    isSelected ? 'scale-105' : 'group-hover:scale-110'
                  }`}
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
              
              {/* Overlay oscuro sutil al hover si no está seleccionado */}
              {!isSelected && (
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
              )}
            </div>

            {/* Información del componente */}
            <div className="flex flex-1 flex-col justify-between p-4">
              <div>
                <h3
                  className={`line-clamp-2 text-sm font-bold leading-tight transition-colors ${
                    isSelected ? 'text-primary' : 'text-slate-800'
                  }`}
                >
                  {component.name}
                </h3>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm font-black text-slate-600">
                  {formatPrice(component.price)}
                </p>
                
                {/* Botón Acción (Icono) */}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
                    isSelected
                      ? 'bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600'
                      : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                  }`}
                >
                  <span className="material-icons-outlined text-[18px]">
                    {isSelected ? 'remove' : 'add'}
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
