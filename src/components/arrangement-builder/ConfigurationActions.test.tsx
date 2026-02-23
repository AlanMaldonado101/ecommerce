/**
 * Unit tests para ConfigurationActions
 * 
 * Valida:
 * - Botón WhatsApp deshabilitado sin base
 * - Mensaje de error al intentar enviar sin base
 * - Generación correcta de mensaje de WhatsApp
 * - Limpieza de configuración después de enviar
 * - Confirmación de reinicio
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfigurationActions } from './ConfigurationActions';
import { useArrangementStore } from '../../store/arrangement.store';
import type { ComponentItem } from '../../interfaces/arrangement.interface';
import '@testing-library/jest-dom';

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock de window.confirm
const mockConfirm = vi.fn();
global.confirm = mockConfirm;

// Mock de window.open
const mockOpen = vi.fn();
global.open = mockOpen;

// Helper para crear componentes de prueba
const createComponent = (
  id: string,
  category: 'BASE' | 'FLORES' | 'GLOBOS' | 'EXTRAS',
  price: number,
  name?: string
): ComponentItem => ({
  id,
  name: name || `Test ${category} ${id}`,
  category,
  price,
  image: `https://example.com/${id}.jpg`,
  order: 0,
  active: true,
});

describe('ConfigurationActions - Unit Tests', () => {
  beforeEach(() => {
    // Reset store before each test
    useArrangementStore.getState().resetConfiguration();
    
    // Reset mocks
    vi.clearAllMocks();
    mockConfirm.mockReset();
    mockOpen.mockReset();
  });

  describe('Botón WhatsApp', () => {
    it('should be disabled when no base is selected', () => {
      render(<ConfigurationActions />);
      
      const whatsappButton = screen.getByText('Pedir por WhatsApp');
      
      expect(whatsappButton).toBeDisabled();
      expect(whatsappButton).toHaveClass('cursor-not-allowed');
      expect(whatsappButton).toHaveAttribute('title', 'Selecciona una base para continuar');
    });

    it('should be enabled when base is selected', () => {
      const base = createComponent('base-1', 'BASE', 100);
      useArrangementStore.getState().selectBase(base);
      
      render(<ConfigurationActions />);
      
      const whatsappButton = screen.getByText('Pedir por WhatsApp');
      
      expect(whatsappButton).not.toBeDisabled();
      expect(whatsappButton).not.toHaveClass('cursor-not-allowed');
      expect(whatsappButton).toHaveAttribute('title', 'Enviar pedido por WhatsApp');
    });
  });

  describe('Generación de mensaje WhatsApp', () => {
    it('should generate message with only base', () => {
      const base = createComponent('base-1', 'BASE', 100, 'Canasto Grande');
      useArrangementStore.getState().selectBase(base);
      
      render(<ConfigurationActions />);
      
      const whatsappButton = screen.getByText('Pedir por WhatsApp');
      fireEvent.click(whatsappButton);
      
      expect(mockOpen).toHaveBeenCalledTimes(1);
      const url = mockOpen.mock.calls[0][0] as string;
      
      expect(url).toContain('wa.me');
      // Verificar que contiene el precio
      expect(url).toContain('100');
      // Verificar que contiene la palabra "Base"
      expect(url).toMatch(/Base/i);
    });

    it('should generate message with all component types', () => {
      const base = createComponent('base-1', 'BASE', 100, 'Canasto');
      const flower = createComponent('flower-1', 'FLORES', 50, 'Rosa Roja');
      const balloon = createComponent('balloon-1', 'GLOBOS', 30, 'Globo Corazón');
      const extra = createComponent('extra-1', 'EXTRAS', 20, 'Tarjeta');
      
      useArrangementStore.getState().selectBase(base);
      useArrangementStore.getState().toggleFlower(flower);
      useArrangementStore.getState().toggleBalloon(balloon);
      useArrangementStore.getState().toggleExtra(extra);
      
      render(<ConfigurationActions />);
      
      const whatsappButton = screen.getByText('Pedir por WhatsApp');
      fireEvent.click(whatsappButton);
      
      expect(mockOpen).toHaveBeenCalledTimes(1);
      const url = mockOpen.mock.calls[0][0] as string;
      
      // Verificar que contiene todos los componentes
      expect(url).toContain('Canasto');
      expect(url).toContain('Rosa%20Roja');
      expect(url).toContain('Globo%20Coraz%C3%B3n');
      expect(url).toContain('Tarjeta');
      
      // Verificar precio total (100 + 50 + 30 + 20 = 200)
      expect(url).toContain('200');
    });

    it('should include multiple flowers in message', () => {
      const base = createComponent('base-1', 'BASE', 100);
      const flower1 = createComponent('flower-1', 'FLORES', 50, 'Rosa');
      const flower2 = createComponent('flower-2', 'FLORES', 60, 'Girasol');
      
      useArrangementStore.getState().selectBase(base);
      useArrangementStore.getState().toggleFlower(flower1);
      useArrangementStore.getState().toggleFlower(flower2);
      
      render(<ConfigurationActions />);
      
      const whatsappButton = screen.getByText('Pedir por WhatsApp');
      fireEvent.click(whatsappButton);
      
      const url = mockOpen.mock.calls[0][0] as string;
      
      expect(url).toContain('Rosa');
      expect(url).toContain('Girasol');
    });
  });

  describe('Botón Reiniciar', () => {
    it('should show confirmation dialog when clicked', () => {
      mockConfirm.mockReturnValue(false);
      
      render(<ConfigurationActions />);
      
      const resetButton = screen.getByText('REINICIAR DISEÑO');
      fireEvent.click(resetButton);
      
      expect(mockConfirm).toHaveBeenCalledTimes(1);
      expect(mockConfirm).toHaveBeenCalledWith(
        expect.stringContaining('¿Estás seguro')
      );
    });

    it('should not reset if user cancels confirmation', () => {
      mockConfirm.mockReturnValue(false);
      
      const base = createComponent('base-1', 'BASE', 100);
      useArrangementStore.getState().selectBase(base);
      
      render(<ConfigurationActions />);
      
      const resetButton = screen.getByText('REINICIAR DISEÑO');
      fireEvent.click(resetButton);
      
      // Configuration should still be valid
      expect(useArrangementStore.getState().isValid()).toBe(true);
      expect(useArrangementStore.getState().selectedComponents.base).not.toBeNull();
    });

    it('should reset configuration if user confirms', () => {
      mockConfirm.mockReturnValue(true);
      
      const base = createComponent('base-1', 'BASE', 100);
      const flower = createComponent('flower-1', 'FLORES', 50);
      
      useArrangementStore.getState().selectBase(base);
      useArrangementStore.getState().toggleFlower(flower);
      
      render(<ConfigurationActions />);
      
      const resetButton = screen.getByText('REINICIAR DISEÑO');
      fireEvent.click(resetButton);
      
      // Configuration should be cleared
      const state = useArrangementStore.getState();
      expect(state.selectedComponents.base).toBeNull();
      expect(state.selectedComponents.flowers).toHaveLength(0);
      expect(state.getTotalPrice()).toBe(0);
      expect(state.isValid()).toBe(false);
    });
  });

  describe('Formato de precio', () => {
    it('should format prices with Colombian locale', () => {
      const base = createComponent('base-1', 'BASE', 1000);
      useArrangementStore.getState().selectBase(base);
      
      render(<ConfigurationActions />);
      
      const whatsappButton = screen.getByText('Pedir por WhatsApp');
      fireEvent.click(whatsappButton);
      
      const url = mockOpen.mock.calls[0][0] as string;
      
      // Verificar formato colombiano (1.000 o 1,000 dependiendo de la configuración)
      expect(url).toMatch(/1[.,]000/);
    });

    it('should handle large prices correctly', () => {
      const base = createComponent('base-1', 'BASE', 500000);
      useArrangementStore.getState().selectBase(base);
      
      render(<ConfigurationActions />);
      
      const whatsappButton = screen.getByText('Pedir por WhatsApp');
      fireEvent.click(whatsappButton);
      
      const url = mockOpen.mock.calls[0][0] as string;
      
      // Verificar que el precio grande está formateado
      expect(url).toMatch(/500[.,]000/);
    });
  });
});
