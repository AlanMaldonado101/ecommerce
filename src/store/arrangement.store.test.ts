/**
 * Unit tests para el Zustand store de arreglos
 * 
 * Valida las funcionalidades básicas del store:
 * - Selección y reemplazo de base
 * - Toggle de flores, globos y extras
 * - Cálculo de precio total
 * - Validación de configuración
 * - Reinicio de configuración
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useArrangementStore } from './arrangement.store';
import type { ComponentItem } from '../interfaces/arrangement.interface';
import '@testing-library/jest-dom';

// Helper para crear componentes de prueba
const createComponent = (
  id: string,
  category: 'BASE' | 'FLORES' | 'GLOBOS' | 'EXTRAS',
  price: number
): ComponentItem => ({
  id,
  name: `Test ${category} ${id}`,
  category,
  price,
  image: `https://example.com/${id}.jpg`,
  order: 0,
  active: true,
});

describe('ArrangementStore - Unit Tests', () => {
  beforeEach(() => {
    // Reset store before each test
    useArrangementStore.getState().resetConfiguration();
  });

  describe('selectBase', () => {
    it('should select a base when none is selected', () => {
      const base = createComponent('base-1', 'BASE', 100);
      
      useArrangementStore.getState().selectBase(base);
      
      const state = useArrangementStore.getState();
      expect(state.selectedComponents.base).toEqual(base);
    });

    it('should replace existing base when selecting a new one', () => {
      const base1 = createComponent('base-1', 'BASE', 100);
      const base2 = createComponent('base-2', 'BASE', 150);
      
      // Select first base
      useArrangementStore.getState().selectBase(base1);
      expect(useArrangementStore.getState().selectedComponents.base).toEqual(base1);
      
      // Select second base (should replace first)
      useArrangementStore.getState().selectBase(base2);
      expect(useArrangementStore.getState().selectedComponents.base).toEqual(base2);
      expect(useArrangementStore.getState().selectedComponents.base).not.toEqual(base1);
    });
  });

  describe('toggleFlower', () => {
    it('should add a flower when not selected', () => {
      const flower = createComponent('flower-1', 'FLORES', 50);
      
      useArrangementStore.getState().toggleFlower(flower);
      
      const state = useArrangementStore.getState();
      expect(state.selectedComponents.flowers).toHaveLength(1);
      expect(state.selectedComponents.flowers[0]).toEqual(flower);
    });

    it('should remove a flower when already selected', () => {
      const flower = createComponent('flower-1', 'FLORES', 50);
      
      // Add flower
      useArrangementStore.getState().toggleFlower(flower);
      expect(useArrangementStore.getState().selectedComponents.flowers).toHaveLength(1);
      
      // Remove flower
      useArrangementStore.getState().toggleFlower(flower);
      expect(useArrangementStore.getState().selectedComponents.flowers).toHaveLength(0);
    });

    it('should allow multiple flowers to be selected', () => {
      const flower1 = createComponent('flower-1', 'FLORES', 50);
      const flower2 = createComponent('flower-2', 'FLORES', 60);
      const flower3 = createComponent('flower-3', 'FLORES', 70);
      
      useArrangementStore.getState().toggleFlower(flower1);
      useArrangementStore.getState().toggleFlower(flower2);
      useArrangementStore.getState().toggleFlower(flower3);
      
      const state = useArrangementStore.getState();
      expect(state.selectedComponents.flowers).toHaveLength(3);
      expect(state.selectedComponents.flowers).toContainEqual(flower1);
      expect(state.selectedComponents.flowers).toContainEqual(flower2);
      expect(state.selectedComponents.flowers).toContainEqual(flower3);
    });
  });

  describe('toggleBalloon', () => {
    it('should add a balloon when not selected', () => {
      const balloon = createComponent('balloon-1', 'GLOBOS', 30);
      
      useArrangementStore.getState().toggleBalloon(balloon);
      
      const state = useArrangementStore.getState();
      expect(state.selectedComponents.balloons).toHaveLength(1);
      expect(state.selectedComponents.balloons[0]).toEqual(balloon);
    });

    it('should remove a balloon when already selected', () => {
      const balloon = createComponent('balloon-1', 'GLOBOS', 30);
      
      // Add balloon
      useArrangementStore.getState().toggleBalloon(balloon);
      expect(useArrangementStore.getState().selectedComponents.balloons).toHaveLength(1);
      
      // Remove balloon
      useArrangementStore.getState().toggleBalloon(balloon);
      expect(useArrangementStore.getState().selectedComponents.balloons).toHaveLength(0);
    });

    it('should allow multiple balloons to be selected', () => {
      const balloon1 = createComponent('balloon-1', 'GLOBOS', 30);
      const balloon2 = createComponent('balloon-2', 'GLOBOS', 35);
      
      useArrangementStore.getState().toggleBalloon(balloon1);
      useArrangementStore.getState().toggleBalloon(balloon2);
      
      const state = useArrangementStore.getState();
      expect(state.selectedComponents.balloons).toHaveLength(2);
      expect(state.selectedComponents.balloons).toContainEqual(balloon1);
      expect(state.selectedComponents.balloons).toContainEqual(balloon2);
    });
  });

  describe('toggleExtra', () => {
    it('should add an extra when not selected', () => {
      const extra = createComponent('extra-1', 'EXTRAS', 20);
      
      useArrangementStore.getState().toggleExtra(extra);
      
      const state = useArrangementStore.getState();
      expect(state.selectedComponents.extras).toHaveLength(1);
      expect(state.selectedComponents.extras[0]).toEqual(extra);
    });

    it('should remove an extra when already selected', () => {
      const extra = createComponent('extra-1', 'EXTRAS', 20);
      
      // Add extra
      useArrangementStore.getState().toggleExtra(extra);
      expect(useArrangementStore.getState().selectedComponents.extras).toHaveLength(1);
      
      // Remove extra
      useArrangementStore.getState().toggleExtra(extra);
      expect(useArrangementStore.getState().selectedComponents.extras).toHaveLength(0);
    });

    it('should allow multiple extras to be selected', () => {
      const extra1 = createComponent('extra-1', 'EXTRAS', 20);
      const extra2 = createComponent('extra-2', 'EXTRAS', 25);
      const extra3 = createComponent('extra-3', 'EXTRAS', 30);
      
      useArrangementStore.getState().toggleExtra(extra1);
      useArrangementStore.getState().toggleExtra(extra2);
      useArrangementStore.getState().toggleExtra(extra3);
      
      const state = useArrangementStore.getState();
      expect(state.selectedComponents.extras).toHaveLength(3);
      expect(state.selectedComponents.extras).toContainEqual(extra1);
      expect(state.selectedComponents.extras).toContainEqual(extra2);
      expect(state.selectedComponents.extras).toContainEqual(extra3);
    });
  });

  describe('getTotalPrice', () => {
    it('should return 0 when no components are selected', () => {
      const total = useArrangementStore.getState().getTotalPrice();
      expect(total).toBe(0);
    });

    it('should calculate price with only base selected', () => {
      const base = createComponent('base-1', 'BASE', 100);
      
      useArrangementStore.getState().selectBase(base);
      
      const total = useArrangementStore.getState().getTotalPrice();
      expect(total).toBe(100);
    });

    it('should calculate total price with all component types', () => {
      const base = createComponent('base-1', 'BASE', 100);
      const flower1 = createComponent('flower-1', 'FLORES', 50);
      const flower2 = createComponent('flower-2', 'FLORES', 60);
      const balloon = createComponent('balloon-1', 'GLOBOS', 30);
      const extra = createComponent('extra-1', 'EXTRAS', 20);
      
      useArrangementStore.getState().selectBase(base);
      useArrangementStore.getState().toggleFlower(flower1);
      useArrangementStore.getState().toggleFlower(flower2);
      useArrangementStore.getState().toggleBalloon(balloon);
      useArrangementStore.getState().toggleExtra(extra);
      
      const total = useArrangementStore.getState().getTotalPrice();
      // 100 + 50 + 60 + 30 + 20 = 260
      expect(total).toBe(260);
    });

    it('should update price when components are removed', () => {
      const base = createComponent('base-1', 'BASE', 100);
      const flower = createComponent('flower-1', 'FLORES', 50);
      
      useArrangementStore.getState().selectBase(base);
      useArrangementStore.getState().toggleFlower(flower);
      
      expect(useArrangementStore.getState().getTotalPrice()).toBe(150);
      
      // Remove flower
      useArrangementStore.getState().toggleFlower(flower);
      expect(useArrangementStore.getState().getTotalPrice()).toBe(100);
    });

    it('should handle components with price 0', () => {
      const base = createComponent('base-1', 'BASE', 0);
      const flower = createComponent('flower-1', 'FLORES', 50);
      
      useArrangementStore.getState().selectBase(base);
      useArrangementStore.getState().toggleFlower(flower);
      
      const total = useArrangementStore.getState().getTotalPrice();
      expect(total).toBe(50);
    });
  });

  describe('isValid', () => {
    it('should return false when no base is selected', () => {
      const isValid = useArrangementStore.getState().isValid();
      expect(isValid).toBe(false);
    });

    it('should return true when base is selected', () => {
      const base = createComponent('base-1', 'BASE', 100);
      
      useArrangementStore.getState().selectBase(base);
      
      const isValid = useArrangementStore.getState().isValid();
      expect(isValid).toBe(true);
    });

    it('should return true with only base and no other components', () => {
      const base = createComponent('base-1', 'BASE', 100);
      
      useArrangementStore.getState().selectBase(base);
      
      const isValid = useArrangementStore.getState().isValid();
      expect(isValid).toBe(true);
      
      const state = useArrangementStore.getState();
      expect(state.selectedComponents.flowers).toHaveLength(0);
      expect(state.selectedComponents.balloons).toHaveLength(0);
      expect(state.selectedComponents.extras).toHaveLength(0);
    });

    it('should return false when base is removed', () => {
      const base = createComponent('base-1', 'BASE', 100);
      
      useArrangementStore.getState().selectBase(base);
      expect(useArrangementStore.getState().isValid()).toBe(true);
      
      useArrangementStore.getState().resetConfiguration();
      expect(useArrangementStore.getState().isValid()).toBe(false);
    });
  });

  describe('resetConfiguration', () => {
    it('should clear all selected components', () => {
      const base = createComponent('base-1', 'BASE', 100);
      const flower = createComponent('flower-1', 'FLORES', 50);
      const balloon = createComponent('balloon-1', 'GLOBOS', 30);
      const extra = createComponent('extra-1', 'EXTRAS', 20);
      
      // Select all components
      useArrangementStore.getState().selectBase(base);
      useArrangementStore.getState().toggleFlower(flower);
      useArrangementStore.getState().toggleBalloon(balloon);
      useArrangementStore.getState().toggleExtra(extra);
      
      // Verify components are selected
      expect(useArrangementStore.getState().selectedComponents.base).not.toBeNull();
      expect(useArrangementStore.getState().selectedComponents.flowers).toHaveLength(1);
      expect(useArrangementStore.getState().selectedComponents.balloons).toHaveLength(1);
      expect(useArrangementStore.getState().selectedComponents.extras).toHaveLength(1);
      
      // Reset
      useArrangementStore.getState().resetConfiguration();
      
      // Verify all cleared
      const state = useArrangementStore.getState();
      expect(state.selectedComponents.base).toBeNull();
      expect(state.selectedComponents.flowers).toHaveLength(0);
      expect(state.selectedComponents.balloons).toHaveLength(0);
      expect(state.selectedComponents.extras).toHaveLength(0);
    });

    it('should reset price to 0', () => {
      const base = createComponent('base-1', 'BASE', 100);
      const flower = createComponent('flower-1', 'FLORES', 50);
      
      useArrangementStore.getState().selectBase(base);
      useArrangementStore.getState().toggleFlower(flower);
      
      expect(useArrangementStore.getState().getTotalPrice()).toBe(150);
      
      useArrangementStore.getState().resetConfiguration();
      
      expect(useArrangementStore.getState().getTotalPrice()).toBe(0);
    });

    it('should make configuration invalid after reset', () => {
      const base = createComponent('base-1', 'BASE', 100);
      
      useArrangementStore.getState().selectBase(base);
      expect(useArrangementStore.getState().isValid()).toBe(true);
      
      useArrangementStore.getState().resetConfiguration();
      expect(useArrangementStore.getState().isValid()).toBe(false);
    });
  });

  describe('Combined scenarios', () => {
    it('should handle complex selection and deselection flow', () => {
      const base1 = createComponent('base-1', 'BASE', 100);
      const base2 = createComponent('base-2', 'BASE', 150);
      const flower1 = createComponent('flower-1', 'FLORES', 50);
      const flower2 = createComponent('flower-2', 'FLORES', 60);
      const balloon = createComponent('balloon-1', 'GLOBOS', 30);
      
      // Select base and components
      useArrangementStore.getState().selectBase(base1);
      useArrangementStore.getState().toggleFlower(flower1);
      useArrangementStore.getState().toggleFlower(flower2);
      useArrangementStore.getState().toggleBalloon(balloon);
      
      expect(useArrangementStore.getState().getTotalPrice()).toBe(240); // 100+50+60+30
      
      // Replace base
      useArrangementStore.getState().selectBase(base2);
      expect(useArrangementStore.getState().getTotalPrice()).toBe(290); // 150+50+60+30
      
      // Remove one flower
      useArrangementStore.getState().toggleFlower(flower1);
      expect(useArrangementStore.getState().getTotalPrice()).toBe(240); // 150+60+30
      
      // Configuration should still be valid
      expect(useArrangementStore.getState().isValid()).toBe(true);
    });

    it('should maintain state consistency across multiple operations', () => {
      const base = createComponent('base-1', 'BASE', 100);
      const flower = createComponent('flower-1', 'FLORES', 50);
      
      // Initial state
      expect(useArrangementStore.getState().isValid()).toBe(false);
      expect(useArrangementStore.getState().getTotalPrice()).toBe(0);
      
      // Add base
      useArrangementStore.getState().selectBase(base);
      expect(useArrangementStore.getState().isValid()).toBe(true);
      expect(useArrangementStore.getState().getTotalPrice()).toBe(100);
      
      // Add flower
      useArrangementStore.getState().toggleFlower(flower);
      expect(useArrangementStore.getState().isValid()).toBe(true);
      expect(useArrangementStore.getState().getTotalPrice()).toBe(150);
      
      // Reset
      useArrangementStore.getState().resetConfiguration();
      expect(useArrangementStore.getState().isValid()).toBe(false);
      expect(useArrangementStore.getState().getTotalPrice()).toBe(0);
    });
  });
});
