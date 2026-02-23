/**
 * Zustand Store para gestión de estado del constructor de arreglos
 * 
 * Este store maneja la selección de componentes (base, flores, globos, extras),
 * cálculo de precio total, validación de configuración y reinicio de diseño.
 * 
 * Requirements: 2.2, 2.4, 3.2, 4.2, 5.2, 7.1, 8.3, 10.1
 */

import { create } from 'zustand';
import type { ArrangementState, ComponentItem } from '../interfaces/arrangement.interface';

/**
 * Store de Zustand para el constructor de arreglos
 * 
 * Gestiona el estado global de la configuración del arreglo personalizado
 */
export const useArrangementStore = create<ArrangementState>((set, get) => ({
  // Estado inicial: sin componentes seleccionados
  selectedComponents: {
    base: null,
    flowers: [],
    balloons: [],
    extras: [],
  },

  /**
   * Selecciona una base para el arreglo
   * Si ya existe una base seleccionada, la reemplaza
   * 
   * @param component - Componente de tipo BASE a seleccionar
   * 
   * Validates: Requirements 2.2, 2.4
   * Property 4: Exclusividad de selección de base
   * Property 5: Reemplazo de base
   */
  selectBase: (component: ComponentItem) => {
    set((state) => ({
      selectedComponents: {
        ...state.selectedComponents,
        base: component,
      },
    }));
  },

  /**
   * Alterna la selección de una flor
   * Si la flor ya está seleccionada, la remueve
   * Si no está seleccionada, la agrega
   * 
   * @param component - Componente de tipo FLORES a alternar
   * 
   * Validates: Requirements 3.2
   * Property 6: Selección múltiple de flores
   */
  toggleFlower: (component: ComponentItem) => {
    set((state) => {
      const flowers = state.selectedComponents.flowers;
      const isSelected = flowers.some((f) => f.id === component.id);

      return {
        selectedComponents: {
          ...state.selectedComponents,
          flowers: isSelected
            ? flowers.filter((f) => f.id !== component.id)
            : [...flowers, component],
        },
      };
    });
  },

  /**
   * Alterna la selección de un globo
   * Si el globo ya está seleccionado, lo remueve
   * Si no está seleccionado, lo agrega
   * 
   * @param component - Componente de tipo GLOBOS a alternar
   * 
   * Validates: Requirements 4.2
   * Property 7: Selección múltiple de globos
   */
  toggleBalloon: (component: ComponentItem) => {
    set((state) => {
      const balloons = state.selectedComponents.balloons;
      const isSelected = balloons.some((b) => b.id === component.id);

      return {
        selectedComponents: {
          ...state.selectedComponents,
          balloons: isSelected
            ? balloons.filter((b) => b.id !== component.id)
            : [...balloons, component],
        },
      };
    });
  },

  /**
   * Alterna la selección de un extra
   * Si el extra ya está seleccionado, lo remueve
   * Si no está seleccionado, lo agrega
   * 
   * @param component - Componente de tipo EXTRAS a alternar
   * 
   * Validates: Requirements 5.2
   * Property 8: Selección múltiple de extras
   */
  toggleExtra: (component: ComponentItem) => {
    set((state) => {
      const extras = state.selectedComponents.extras;
      const isSelected = extras.some((e) => e.id === component.id);

      return {
        selectedComponents: {
          ...state.selectedComponents,
          extras: isSelected
            ? extras.filter((e) => e.id !== component.id)
            : [...extras, component],
        },
      };
    });
  },

  /**
   * Reinicia la configuración del arreglo a estado inicial
   * Limpia todos los componentes seleccionados
   * 
   * Validates: Requirements 8.3
   * Property 13: Reinicio limpia configuración
   */
  resetConfiguration: () => {
    set({
      selectedComponents: {
        base: null,
        flowers: [],
        balloons: [],
        extras: [],
      },
    });
  },

  /**
   * Calcula el precio total del arreglo
   * Suma los precios de todos los componentes seleccionados
   * 
   * @returns Precio total del arreglo
   * 
   * Validates: Requirements 7.1, 2.5, 3.5, 4.5, 5.5
   * Property 11: Cálculo de precio total
   */
  getTotalPrice: () => {
    const { base, flowers, balloons, extras } = get().selectedComponents;

    const basePrice = base?.price || 0;
    const flowersPrice = flowers.reduce((sum, flower) => sum + flower.price, 0);
    const balloonsPrice = balloons.reduce((sum, balloon) => sum + balloon.price, 0);
    const extrasPrice = extras.reduce((sum, extra) => sum + extra.price, 0);

    return basePrice + flowersPrice + balloonsPrice + extrasPrice;
  },

  /**
   * Verifica si la configuración actual es válida
   * Una configuración es válida si tiene al menos una base seleccionada
   * 
   * @returns true si hay base seleccionada, false en caso contrario
   * 
   * Validates: Requirements 10.1, 10.3
   * Property 14: Validación de configuración
   */
  isValid: () => {
    return get().selectedComponents.base !== null;
  },
}));
