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
  // Estado para la categoría activa en stepper
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

  // Scroll al inicio al montar el componente o cambiar de paso
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeCategory]);

  const steps: ComponentCategory[] = ['BASE', 'FLORES', 'GLOBOS', 'EXTRAS'];
  const currentStepIndex = steps.indexOf(activeCategory);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setActiveCategory(steps[currentStepIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setActiveCategory(steps[currentStepIndex - 1]);
    }
  };

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
        {/* Progress Stepper */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex min-w-max items-center justify-between gap-4 px-2">
            {steps.map((step, index) => {
              const isPast = steps.indexOf(activeCategory) > index;
              const isActive = activeCategory === step;
              return (
                <div key={step} className="flex flex-1 items-center">
                  <button
                    onClick={() => setActiveCategory(step)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-primary text-white ring-4 ring-primary/20 scale-110'
                          : isPast
                          ? 'bg-primary text-white'
                          : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'
                      }`}
                    >
                      {isPast ? <span className="material-icons-outlined text-sm">check</span> : index + 1}
                    </div>
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                        isActive || isPast ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      {step}
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-4 h-1 flex-1 rounded-full transition-colors ${
                        isPast ? 'bg-primary' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Layout Desktop: Grid de 2 columnas con sticky */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          
          {/* Columna Izquierda: Selectores de componentes (7 columnas en Desktop) */}
          <div className="space-y-6 lg:col-span-7 xl:col-span-8">
            <div className="rounded-xl bg-white p-6 shadow-lg">
              {/* Header interactivo basado en la categoría */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  {activeCategory === 'BASE' && (
                    <>
                      Elige tu Base <span className="ml-2 text-sm font-normal text-red-500">*Requerido</span>
                    </>
                  )}
                  {activeCategory === 'FLORES' && 'Añade hermosas flores'}
                  {activeCategory === 'GLOBOS' && 'Añade globos festivos'}
                  {activeCategory === 'EXTRAS' && 'Toques finales (Extras)'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {activeCategory === 'BASE' && 'El cimiento de tu arreglo floral.'}
                  {activeCategory === 'FLORES' && 'Puedes seleccionar los tipos y cantidad que gustes.'}
                  {activeCategory === 'GLOBOS' && 'Personaliza con mensajes especiales.'}
                  {activeCategory === 'EXTRAS' && 'Chocolates, peluches y más.'}
                </p>
              </div>

              {/* Renderizar categoría activa */}
              <div className="min-h-[400px]">
                {activeCategory === 'BASE' && (
                  <ComponentSelector
                    category="BASE"
                    components={baseComponents}
                    selectedIds={selectedBaseIds}
                    onToggle={selectBase}
                  />
                )}
                {activeCategory === 'FLORES' && (
                  <ComponentSelector
                    category="FLORES"
                    components={flowerComponents}
                    selectedIds={selectedFlowerIds}
                    onToggle={toggleFlower}
                  />
                )}
                {activeCategory === 'GLOBOS' && (
                  <ComponentSelector
                    category="GLOBOS"
                    components={balloonComponents}
                    selectedIds={selectedBalloonIds}
                    onToggle={toggleBalloon}
                  />
                )}
                {activeCategory === 'EXTRAS' && (
                  <ComponentSelector
                    category="EXTRAS"
                    components={extraComponents}
                    selectedIds={selectedExtraIds}
                    onToggle={toggleExtra}
                  />
                )}
              </div>

              {/* Controles de Navegación del Wizard */}
              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStepIndex === 0}
                  className={`flex items-center gap-2 rounded-lg px-6 py-2.5 font-semibold transition-colors ${
                    currentStepIndex === 0
                      ? 'cursor-not-allowed text-slate-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="material-icons-outlined text-sm">arrow_back</span>
                  Anterior
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentStepIndex === steps.length - 1}
                  className={`flex items-center gap-2 rounded-lg px-8 py-2.5 font-bold transition-all ${
                    currentStepIndex === steps.length - 1
                      ? 'opacity-0 pointer-events-none'
                      : 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5'
                  }`}
                >
                  Siguiente
                  <span className="material-icons-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Preview y Precio pegajoso (5/4 columnas en Desktop) */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-5 xl:col-span-4">
            {/* Preview Canvas */}
            <div className="rounded-xl bg-white p-6 shadow-lg ring-1 ring-slate-100">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Tu Arreglo</h2>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  Vista Previa
                </span>
              </div>
              <PreviewCanvas />
            </div>

            {/* Price Calculator & Actions */}
            <div className="rounded-xl bg-primary/5 p-6 shadow-lg ring-1 ring-primary/20">
              <PriceCalculator />
              <div className="mt-6 border-t border-primary/10 pt-6">
                <ConfigurationActions />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
