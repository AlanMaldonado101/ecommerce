/**
 * ArrangementBuilder - Página principal del constructor de arreglos
 * 
 * Esta página integra todos los componentes del sistema "Arma tu Arreglo",
 * permitiendo a los clientes personalizar arreglos florales seleccionando
 * componentes de cuatro categorías: BASE, FLORES, GLOBOS y EXTRAS.
 * 
 * Requirements: 2.1, 6.1, 11.2, 13.1, 13.2, 13.3, 13.4, 13.5
 */

import { useState, useEffect } from 'react';
import { ComponentSelector } from '../components/arrangement-builder/ComponentSelector';
import { PreviewCanvas } from '../components/arrangement-builder/PreviewCanvas';
import { PriceCalculator } from '../components/arrangement-builder/PriceCalculator';
import { ConfigurationActions } from '../components/arrangement-builder/ConfigurationActions';
import { useArrangementComponents } from '../hooks/useArrangementComponents';
import { useArrangementConfig } from '../hooks/useArrangementConfig';
import { useArrangementStore } from '../store/arrangement.store';
import type { ComponentCategory } from '../interfaces/arrangement.interface';

/**
 * Página principal del constructor de arreglos
 * 
 * Integra:
 * - ComponentSelector: Selector de componentes por categoría
 * - PreviewCanvas: Visualización en tiempo real del arreglo
 * - PriceCalculator: Cálculo y display del precio total
 * - ConfigurationActions: Botones de reinicio y envío por WhatsApp
 * 
 * Características:
 * - Diseño responsive (mobile, tablet, desktop)
 * - Persistencia automática de configuración
 * - Carga de configuración guardada al montar
 * - Pestañas/acordeón en mobile para categorías
 * 
 * Validates: Requirements 2.1, 6.1, 11.2, 13.1, 13.2, 13.3, 13.4, 13.5
 */
export const ArrangementBuilder = () => {
  // Estado para la categoría activa en mobile (pestañas)
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('BASE');

  // Cargar componentes de todas las categorías
  const { components: allComponents, isLoading, error, retry } = useArrangementComponents();

  // Hook de persistencia (carga configuración guardada automáticamente)
  useArrangementConfig();

  // Obtener estado y acciones del store
  const { selectedComponents, selectBase, toggleFlower, toggleBalloon, toggleExtra } =
    useArrangementStore();

  // Filtrar componentes por categoría
  const baseComponents = allComponents.filter((c) => c.category === 'BASE');
  const flowerComponents = allComponents.filter((c) => c.category === 'FLORES');
  const balloonComponents = allComponents.filter((c) => c.category === 'GLOBOS');
  const extraComponents = allComponents.filter((c) => c.category === 'EXTRAS');

  // Obtener IDs de componentes seleccionados por categoría
  const selectedBaseIds = selectedComponents.base ? [selectedComponents.base.id] : [];
  const selectedFlowerIds = selectedComponents.flowers.map((f) => f.id);
  const selectedBalloonIds = selectedComponents.balloons.map((b) => b.id);
  const selectedExtraIds = selectedComponents.extras.map((e) => e.id);

  // Scroll al inicio al montar el componente
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Manejo de errores de carga
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-md rounded-lg border-2 border-red-200 bg-red-50 p-6 text-center">
          <span className="material-icons-outlined mb-3 text-5xl text-red-500">error</span>
          <h2 className="mb-2 text-xl font-bold text-red-800">Error al cargar componentes</h2>
          <p className="mb-4 text-red-600">{error.message}</p>
          <button
            onClick={retry}
            className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Estado de carga
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-slate-600">Cargando componentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-center text-3xl font-bold text-slate-800 md:text-4xl">
            Arma tu Arreglo
          </h1>
          <p className="mt-2 text-center text-slate-600">
            Personaliza tu arreglo floral seleccionando los componentes que más te gusten
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Layout Desktop: Grid de 2 columnas */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Columna izquierda: Preview y Precio */}
          <div className="space-y-6">
            {/* Preview Canvas */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold text-slate-800">Vista Previa</h2>
              <PreviewCanvas />
            </div>

            {/* Price Calculator */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <PriceCalculator />
            </div>

            {/* Configuration Actions */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <ConfigurationActions />
            </div>
          </div>

          {/* Columna derecha: Selectores de componentes */}
          <div className="space-y-6">
            {/* Mobile: Pestañas para categorías */}
            <div className="lg:hidden">
              <div className="mb-4 flex gap-2 overflow-x-auto rounded-lg bg-white p-2 shadow-lg">
                <button
                  onClick={() => setActiveCategory('BASE')}
                  className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    activeCategory === 'BASE'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Base
                </button>
                <button
                  onClick={() => setActiveCategory('FLORES')}
                  className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    activeCategory === 'FLORES'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Flores
                </button>
                <button
                  onClick={() => setActiveCategory('GLOBOS')}
                  className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    activeCategory === 'GLOBOS'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Globos
                </button>
                <button
                  onClick={() => setActiveCategory('EXTRAS')}
                  className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    activeCategory === 'EXTRAS'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Extras
                </button>
              </div>

              {/* Contenido de la categoría activa en mobile */}
              <div className="rounded-xl bg-white p-6 shadow-lg">
                {activeCategory === 'BASE' && (
                  <>
                    <h2 className="mb-4 text-xl font-bold text-slate-800">
                      Selecciona una Base
                      <span className="ml-2 text-sm font-normal text-red-500">*Requerido</span>
                    </h2>
                    <ComponentSelector
                      category="BASE"
                      components={baseComponents}
                      selectedIds={selectedBaseIds}
                      onToggle={selectBase}
                    />
                  </>
                )}
                {activeCategory === 'FLORES' && (
                  <>
                    <h2 className="mb-4 text-xl font-bold text-slate-800">Selecciona Flores</h2>
                    <ComponentSelector
                      category="FLORES"
                      components={flowerComponents}
                      selectedIds={selectedFlowerIds}
                      onToggle={toggleFlower}
                    />
                  </>
                )}
                {activeCategory === 'GLOBOS' && (
                  <>
                    <h2 className="mb-4 text-xl font-bold text-slate-800">Selecciona Globos</h2>
                    <ComponentSelector
                      category="GLOBOS"
                      components={balloonComponents}
                      selectedIds={selectedBalloonIds}
                      onToggle={toggleBalloon}
                    />
                  </>
                )}
                {activeCategory === 'EXTRAS' && (
                  <>
                    <h2 className="mb-4 text-xl font-bold text-slate-800">Selecciona Extras</h2>
                    <ComponentSelector
                      category="EXTRAS"
                      components={extraComponents}
                      selectedIds={selectedExtraIds}
                      onToggle={toggleExtra}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Desktop: Todas las categorías visibles */}
            <div className="hidden space-y-6 lg:block">
              {/* Base */}
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-bold text-slate-800">
                  Selecciona una Base
                  <span className="ml-2 text-sm font-normal text-red-500">*Requerido</span>
                </h2>
                <ComponentSelector
                  category="BASE"
                  components={baseComponents}
                  selectedIds={selectedBaseIds}
                  onToggle={selectBase}
                />
              </div>

              {/* Flores */}
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-bold text-slate-800">Selecciona Flores</h2>
                <ComponentSelector
                  category="FLORES"
                  components={flowerComponents}
                  selectedIds={selectedFlowerIds}
                  onToggle={toggleFlower}
                />
              </div>

              {/* Globos */}
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-bold text-slate-800">Selecciona Globos</h2>
                <ComponentSelector
                  category="GLOBOS"
                  components={balloonComponents}
                  selectedIds={selectedBalloonIds}
                  onToggle={toggleBalloon}
                />
              </div>

              {/* Extras */}
              <div className="rounded-xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-bold text-slate-800">Selecciona Extras</h2>
                <ComponentSelector
                  category="EXTRAS"
                  components={extraComponents}
                  selectedIds={selectedExtraIds}
                  onToggle={toggleExtra}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
