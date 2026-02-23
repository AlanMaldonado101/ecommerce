/**
 * Hook para cargar componentes de arreglos desde Supabase
 * 
 * Este hook gestiona la carga de componentes del sistema "Arma tu Arreglo",
 * con soporte para filtrado por categoría, manejo de errores y reintentos.
 */

import { useEffect, useState } from 'react';
import { ComponentCategory, ComponentItem } from '../interfaces/arrangement.interface';
import { 
  getArrangementComponents, 
  getArrangementComponentsByCategory 
} from '../actions/arrangement';

interface UseArrangementComponentsResult {
  /** Componentes cargados desde Supabase */
  components: ComponentItem[];
  /** Indica si la carga está en progreso */
  isLoading: boolean;
  /** Error ocurrido durante la carga (null si no hay error) */
  error: Error | null;
  /** Función para reintentar la carga en caso de error */
  retry: () => void;
}

/**
 * Hook para cargar componentes de arreglos desde Supabase
 * 
 * @param category - Categoría opcional para filtrar componentes (BASE, FLORES, GLOBOS, EXTRAS)
 *                   Si no se especifica, carga todos los componentes activos
 * @returns Objeto con componentes, estado de carga, error y función de reintento
 * 
 * @example
 * // Cargar todos los componentes
 * const { components, isLoading, error, retry } = useArrangementComponents();
 * 
 * @example
 * // Cargar solo bases
 * const { components, isLoading, error } = useArrangementComponents('BASE');
 */
export const useArrangementComponents = (
  category?: ComponentCategory
): UseArrangementComponentsResult => {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    const loadComponents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let data: ComponentItem[];
        
        if (category) {
          // Cargar componentes filtrados por categoría
          data = await getArrangementComponentsByCategory(category);
        } else {
          // Cargar todos los componentes
          data = await getArrangementComponents();
        }

        setComponents(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err : new Error('Error desconocido al cargar componentes');
        setError(errorMessage);
        console.error('Error en useArrangementComponents:', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadComponents();
  }, [category, retryCount]);

  const retry = () => {
    setRetryCount(prev => prev + 1);
  };

  return {
    components,
    isLoading,
    error,
    retry,
  };
};
