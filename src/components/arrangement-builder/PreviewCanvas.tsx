/**
 * Componente PreviewCanvas - Visualización del arreglo en construcción
 * 
 * Este componente renderiza una vista previa del arreglo personalizado,
 * mostrando los componentes seleccionados en capas según su categoría.
 * 
 * Requirements: 2.3, 3.3, 3.4, 4.3, 4.4, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5
 * Property 9: Preview muestra todos los componentes seleccionados
 * Property 10: Orden de capas en preview
 */

import { useState } from 'react';
import { useArrangementStore } from '../../store/arrangement.store';
import './PreviewCanvas.css';

/**
 * Componente que muestra la visualización en tiempo real del arreglo
 * 
 * Renderiza los componentes seleccionados en capas:
 * - Base (fondo)
 * - Flores
 * - Globos
 * - Extras (frente)
 * 
 * Muestra mensaje indicativo cuando no hay base seleccionada
 * Maneja errores de carga de imágenes con placeholders
 * 
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5
 */
export const PreviewCanvas = () => {
  const selectedComponents = useArrangementStore((state) => state.selectedComponents);
  const { base, flowers, balloons, extras } = selectedComponents;

  // Estado para manejar errores de carga de imágenes
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  /**
   * Maneja errores de carga de imágenes
   * Agrega el ID del componente al set de errores para mostrar placeholder
   */
  const handleImageError = (componentId: string) => {
    setImageErrors((prev) => new Set(prev).add(componentId));
  };

  /**
   * Verifica si una imagen falló al cargar
   */
  const hasImageError = (componentId: string) => {
    return imageErrors.has(componentId);
  };

  // Mostrar mensaje cuando no hay base seleccionada
  if (!base) {
    return (
      <div className="preview-canvas preview-canvas--empty">
        <div className="preview-canvas__empty-message">
          <svg
            className="preview-canvas__empty-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p className="preview-canvas__empty-text">
            Selecciona una base para comenzar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-canvas">
      <div className="preview-canvas__container">
        {/* Capa 1: Base (fondo) */}
        <div className="preview-canvas__layer preview-canvas__layer--base">
          {hasImageError(base.id) ? (
            <div className="preview-canvas__placeholder">
              <span className="preview-canvas__placeholder-text">
                {base.name}
              </span>
            </div>
          ) : (
            <img
              src={base.image}
              alt={base.name}
              className="preview-canvas__image preview-canvas__image--base"
              onError={() => handleImageError(base.id)}
            />
          )}
        </div>

        {/* Capa 2: Flores */}
        {flowers.length > 0 && (
          <div className="preview-canvas__layer preview-canvas__layer--flowers">
            {flowers.map((flower) => (
              <div key={flower.id} className="preview-canvas__item">
                {hasImageError(flower.id) ? (
                  <div className="preview-canvas__placeholder preview-canvas__placeholder--small">
                    <span className="preview-canvas__placeholder-text">
                      {flower.name}
                    </span>
                  </div>
                ) : (
                  <img
                    src={flower.image}
                    alt={flower.name}
                    className="preview-canvas__image preview-canvas__image--flower"
                    onError={() => handleImageError(flower.id)}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Capa 3: Globos */}
        {balloons.length > 0 && (
          <div className="preview-canvas__layer preview-canvas__layer--balloons">
            {balloons.map((balloon) => (
              <div key={balloon.id} className="preview-canvas__item">
                {hasImageError(balloon.id) ? (
                  <div className="preview-canvas__placeholder preview-canvas__placeholder--small">
                    <span className="preview-canvas__placeholder-text">
                      {balloon.name}
                    </span>
                  </div>
                ) : (
                  <img
                    src={balloon.image}
                    alt={balloon.name}
                    className="preview-canvas__image preview-canvas__image--balloon"
                    onError={() => handleImageError(balloon.id)}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Capa 4: Extras (frente) */}
        {extras.length > 0 && (
          <div className="preview-canvas__layer preview-canvas__layer--extras">
            {extras.map((extra) => (
              <div key={extra.id} className="preview-canvas__item">
                {hasImageError(extra.id) ? (
                  <div className="preview-canvas__placeholder preview-canvas__placeholder--small">
                    <span className="preview-canvas__placeholder-text">
                      {extra.name}
                    </span>
                  </div>
                ) : (
                  <img
                    src={extra.image}
                    alt={extra.name}
                    className="preview-canvas__image preview-canvas__image--extra"
                    onError={() => handleImageError(extra.id)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
