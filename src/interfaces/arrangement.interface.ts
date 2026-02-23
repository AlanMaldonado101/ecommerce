/**
 * Interfaces y tipos para el sistema "Arma tu Arreglo"
 * 
 * Este archivo define los tipos TypeScript para el constructor interactivo
 * de arreglos florales personalizados.
 */

/**
 * Categorías de componentes disponibles para arreglos
 */
export type ComponentCategory = 'BASE' | 'FLORES' | 'GLOBOS' | 'EXTRAS';

/**
 * Componente individual del arreglo
 * Representa un elemento seleccionable (base, flor, globo o extra)
 */
export interface ComponentItem {
  /** Identificador único del componente */
  id: string;
  /** Nombre descriptivo del componente */
  name: string;
  /** Categoría a la que pertenece el componente */
  category: ComponentCategory;
  /** Precio del componente */
  price: number;
  /** URL de la imagen del componente */
  image: string;
  /** Orden de visualización (menor = primero) */
  order: number;
}

/**
 * Configuración completa del arreglo personalizado
 * Contiene todos los componentes seleccionados por el usuario
 */
export interface ArrangementConfiguration {
  /** Base seleccionada (obligatoria, solo una) */
  base: ComponentItem | null;
  /** Flores seleccionadas (opcional, múltiples) */
  flowers: ComponentItem[];
  /** Globos seleccionados (opcional, múltiples) */
  balloons: ComponentItem[];
  /** Extras seleccionados (opcional, múltiples) */
  extras: ComponentItem[];
  /** Timestamp de creación/modificación (para expiración de 24h) */
  timestamp: number;
}

/**
 * Mensaje de WhatsApp generado para enviar el pedido
 */
export interface WhatsAppMessage {
  /** Texto del mensaje con detalles del arreglo */
  text: string;
  /** Número de teléfono de destino */
  phoneNumber: string;
}

/**
 * Configuración almacenada en localStorage
 * Incluye versión para compatibilidad futura y timestamp de expiración
 */
export interface StoredConfiguration {
  /** Versión del formato de almacenamiento */
  version: 1;
  /** Datos de la configuración del arreglo */
  data: ArrangementConfiguration;
  /** Timestamp de expiración (24 horas después de guardado) */
  expiresAt: number;
}

/**
 * Estado del store de Zustand para gestión de arreglos
 */
export interface ArrangementState {
  /** Componentes seleccionados organizados por categoría */
  selectedComponents: {
    base: ComponentItem | null;
    flowers: ComponentItem[];
    balloons: ComponentItem[];
    extras: ComponentItem[];
  };
  
  /** Selecciona una base (reemplaza la anterior si existe) */
  selectBase: (component: ComponentItem) => void;
  
  /** Alterna la selección de una flor (agregar/remover) */
  toggleFlower: (component: ComponentItem) => void;
  
  /** Alterna la selección de un globo (agregar/remover) */
  toggleBalloon: (component: ComponentItem) => void;
  
  /** Alterna la selección de un extra (agregar/remover) */
  toggleExtra: (component: ComponentItem) => void;
  
  /** Reinicia la configuración a estado inicial (vacío) */
  resetConfiguration: () => void;
  
  /** Calcula y retorna el precio total de todos los componentes seleccionados */
  getTotalPrice: () => number;
  
  /** Verifica si la configuración es válida (tiene base seleccionada) */
  isValid: () => boolean;
}
