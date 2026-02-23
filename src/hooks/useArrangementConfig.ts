/**
 * Hook para gestionar la persistencia de la configuración del arreglo en localStorage
 * 
 * Este hook proporciona funciones para guardar, cargar y limpiar la configuración
 * del arreglo personalizado, con validación de expiración de 24 horas.
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */

import { useEffect } from 'react';
import { useArrangementStore } from '../store/arrangement.store';
import type { StoredConfiguration, ArrangementConfiguration } from '../interfaces/arrangement.interface';

/** Clave para almacenar la configuración en localStorage */
const STORAGE_KEY = 'arrangement_config';

/** Duración de validez de la configuración guardada (24 horas en milisegundos) */
const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Hook para gestionar la persistencia de la configuración del arreglo
 * 
 * Proporciona funciones para:
 * - Guardar configuración en localStorage con timestamp
 * - Cargar configuración validando expiración de 24 horas
 * - Limpiar configuración de localStorage
 * - Sincronización automática con el store de Zustand
 * 
 * @returns Objeto con funciones saveConfig, loadConfig y clearConfig
 * 
 * Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5
 * Property 17: Persistencia round trip
 * Property 18: Limpieza de localStorage
 * Property 19: Expiración de configuración guardada
 */
export function useArrangementConfig() {
  const selectedComponents = useArrangementStore((state) => state.selectedComponents);

  /**
   * Guarda la configuración actual en localStorage con timestamp
   * 
   * @param config - Configuración del arreglo a guardar
   * 
   * Validates: Requirements 11.1
   * Property 17: Persistencia round trip (parte 1: guardar)
   */
  const saveConfig = (config?: ArrangementConfiguration) => {
    try {
      const now = Date.now();
      const configToSave: ArrangementConfiguration = config || {
        ...selectedComponents,
        timestamp: now,
      };

      const storedConfig: StoredConfiguration = {
        version: 1,
        data: configToSave,
        expiresAt: now + EXPIRATION_TIME,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedConfig));
    } catch (error) {
      // Manejo silencioso de errores (cuota excedida, permisos, etc.)
      // El sistema continúa funcionando sin persistencia
      console.error('Error al guardar configuración en localStorage:', error);
    }
  };

  /**
   * Carga la configuración desde localStorage y valida expiración
   * 
   * @returns Configuración cargada o null si no existe o está expirada
   * 
   * Validates: Requirements 11.2, 11.5
   * Property 17: Persistencia round trip (parte 2: cargar)
   * Property 19: Expiración de configuración guardada
   */
  const loadConfig = (): ArrangementConfiguration | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      
      if (!stored) {
        return null;
      }

      const storedConfig: StoredConfiguration = JSON.parse(stored);
      const now = Date.now();

      // Validar expiración de 24 horas
      if (now > storedConfig.expiresAt) {
        // Configuración expirada, limpiar localStorage
        clearConfig();
        return null;
      }

      // Validar versión del formato
      if (storedConfig.version !== 1) {
        console.warn('Versión de configuración no compatible');
        clearConfig();
        return null;
      }

      return storedConfig.data;
    } catch (error) {
      // Error al parsear o leer localStorage
      console.error('Error al cargar configuración desde localStorage:', error);
      clearConfig(); // Limpiar datos corruptos
      return null;
    }
  };

  /**
   * Limpia la configuración guardada en localStorage
   * 
   * Validates: Requirements 11.3, 11.4
   * Property 18: Limpieza de localStorage
   */
  const clearConfig = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error al limpiar configuración de localStorage:', error);
    }
  };

  /**
   * Efecto para cargar configuración al montar el componente
   * Restaura la configuración guardada si existe y no ha expirado
   * 
   * Validates: Requirements 11.2
   */
  useEffect(() => {
    const savedConfig = loadConfig();
    
    if (savedConfig) {
      // Restaurar configuración en el store
      const store = useArrangementStore.getState();
      
      if (savedConfig.base) {
        store.selectBase(savedConfig.base);
      }
      
      savedConfig.flowers.forEach((flower) => {
        store.toggleFlower(flower);
      });
      
      savedConfig.balloons.forEach((balloon) => {
        store.toggleBalloon(balloon);
      });
      
      savedConfig.extras.forEach((extra) => {
        store.toggleExtra(extra);
      });
    }
  }, []); // Solo ejecutar al montar

  /**
   * Efecto para sincronizar automáticamente con el store de Zustand
   * Guarda la configuración cada vez que cambian los componentes seleccionados
   * 
   * Validates: Requirements 11.1
   */
  useEffect(() => {
    // Guardar configuración automáticamente cuando cambia
    saveConfig();
  }, [selectedComponents]);

  return {
    saveConfig,
    loadConfig,
    clearConfig,
  };
}
