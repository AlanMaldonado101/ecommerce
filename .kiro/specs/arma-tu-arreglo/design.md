# Design Document: Arma tu Arreglo

## Overview

El sistema "Arma tu Arreglo" es un constructor interactivo que permite a los clientes personalizar arreglos florales mediante la selección de componentes de cuatro categorías: BASE, FLORES, GLOBOS y EXTRAS. El sistema proporciona visualización en tiempo real del arreglo en construcción y cálculo automático del precio total.

La funcionalidad se integra completamente con la infraestructura existente de la aplicación:
- Los componentes se gestionan mediante el formulario de productos existente (FormProduct.tsx), agregando campos adicionales para marcar productos como componentes de arreglo
- Los arreglos personalizados se agregan al carrito de compras existente, donde cada componente seleccionado se añade como un item separado con metadata para agruparlos
- Los clientes pueden guardar su configuración localmente, reiniciar el diseño, y proceder al checkout estándar

### Key Design Decisions

1. **Integración con formulario de productos existente**: Los administradores usan el mismo FormProduct.tsx para crear componentes, agregando campos `is_arrangement_component` y `component_category` cuando la categoría es "componente-arreglo". Esto evita crear interfaces administrativas separadas y mantiene consistencia en el flujo de trabajo.

2. **Integración con carrito de compras**: En lugar de un flujo de pedido separado, cada componente seleccionado se agrega al carrito como un item individual usando el `useCartStore` existente. Los items se agrupan mediante un `arrangement_group_id` único para identificar que pertenecen al mismo arreglo personalizado.

3. **Persistencia local**: La configuración del cliente se guarda en localStorage para mantener el trabajo entre sesiones, con expiración automática de 24 horas.

4. **Validación mínima**: Solo se requiere una base para considerar válida una configuración, permitiendo máxima flexibilidad al cliente.

5. **Reutilización de infraestructura**: Los componentes se almacenan como productos especiales en la tabla existente, aprovechando el sistema de imágenes, precios, variantes y gestión ya implementado.

## Architecture

### Component Structure

```
src/
├── pages/
│   └── ArrangementBuilder.tsx          # Página principal del constructor
├── components/
│   ├── arrangement-builder/
│   │   ├── ComponentSelector.tsx       # Selector de componentes por categoría
│   │   ├── PreviewCanvas.tsx          # Canvas de visualización del arreglo
│   │   ├── PriceCalculator.tsx        # Display del precio total
│   │   └── ConfigurationActions.tsx   # Botones de acción (Reiniciar, Agregar al Carrito)
│   └── dashboard/
│       └── products/
│           └── FormProduct.tsx        # Formulario existente (extendido para componentes)
├── hooks/
│   ├── useArrangementComponents.ts    # Hook para cargar componentes desde Supabase
│   └── useArrangementConfig.ts        # Hook para gestionar configuración y persistencia
├── store/
│   ├── arrangement.store.ts           # Zustand store para estado del constructor
│   └── cart.store.ts                  # Zustand store existente del carrito
├── actions/
│   └── arrangement.ts                 # Acciones para componentes de arreglos
└── interfaces/
    └── arrangement.interface.ts       # Tipos TypeScript para el sistema
```

### Integration Points

#### 1. Product Form Integration (Admin)

El formulario de productos existente (`FormProduct.tsx`) se extiende para soportar componentes de arreglo:

- Cuando `category === 'componente-arreglo'`, se muestra una sección adicional "Configuración de Componente"
- Campos adicionales:
  - `component_category`: Select con opciones BASE, FLORES, GLOBOS, EXTRAS
  - `component_order`: Input numérico para orden de visualización
- Validación: Si es componente-arreglo, `component_category` es requerido
- Los demás campos del producto (nombre, precio, imágenes, variantes) funcionan normalmente

#### 2. Cart Integration (Customer)

El constructor se integra con el carrito existente (`useCartStore`):

- Cada componente seleccionado se agrega como un `ICartItem` separado
- Se genera un `arrangementGroupId` único (UUID v4) para el arreglo completo
- Metadata adicional en cada item:
  - `arrangementGroupId`: UUID del arreglo
  - `isArrangementComponent`: true
  - `componentCategory`: Categoría del componente
- El carrito agrupa visualmente items con el mismo `arrangementGroupId`
- La cantidad de cada componente es siempre 1 (no modificable individualmente)

#### 3. Cart Display Enhancement

El componente `Cart.tsx` y `CartItem.tsx` se extienden para mostrar arreglos agrupados:

- Items con `isArrangementComponent === true` se agrupan por `arrangementGroupId`
- Visualización:
  ```
  🌸 Arreglo Personalizado
    ├─ Base: Canasto de mimbre - $50
    ├─ Flores: Rosas rojas - $30
    ├─ Flores: Girasoles - $25
    └─ Globo: Corazón rojo - $15
    Total del arreglo: $120
  ```
- Opción de eliminar el arreglo completo (todos los items del grupo)
- Los items individuales no muestran controles de cantidad
- El precio total del arreglo se muestra destacado

### Data Flow

1. **Carga inicial**: `useArrangementComponents` obtiene componentes activos de Supabase filtrados por `category = 'componente-arreglo'` y `active = true`
2. **Selección**: Usuario selecciona/deselecciona componentes → actualiza `useArrangementStore` (Zustand)
3. **Persistencia**: Store sincroniza automáticamente con localStorage
4. **Visualización**: PreviewCanvas reacciona a cambios en el store y actualiza la composición visual
5. **Cálculo**: PriceCalculator suma precios de componentes seleccionados en tiempo real
6. **Agregar al carrito**: ConfigurationActions valida configuración → genera `arrangement_group_id` único → agrega cada componente al `useCartStore` como item separado con metadata de agrupación
7. **Checkout**: Usuario procede al checkout estándar donde los items del arreglo se muestran agrupados visualmente

### State Management

Utilizamos Zustand para gestionar el estado global del constructor:

```typescript
interface ArrangementState {
  selectedComponents: {
    base: ComponentItem | null;
    flowers: ComponentItem[];
    balloons: ComponentItem[];
    extras: ComponentItem[];
  };
  selectBase: (component: ComponentItem) => void;
  toggleFlower: (component: ComponentItem) => void;
  toggleBalloon: (component: ComponentItem) => void;
  toggleExtra: (component: ComponentItem) => void;
  resetConfiguration: () => void;
  getTotalPrice: () => number;
  isValid: () => boolean;
  addToCart: () => void; // Nueva acción para agregar al carrito
}
```

El sistema reutiliza el `useCartStore` existente para agregar items:

```typescript
interface CartState {
  items: ICartItem[];
  totalItemsInCart: number;
  totalAmount: number;
  addItem: (item: ICartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  cleanCart: () => void;
}
```

## Components and Interfaces

### Core Interfaces

```typescript
// Categorías de componentes
type ComponentCategory = 'BASE' | 'FLORES' | 'GLOBOS' | 'EXTRAS';

// Componente individual del arreglo (basado en producto existente)
interface ComponentItem {
  id: string;
  name: string;
  category: ComponentCategory;
  price: number;
  image: string;
  order: number;
  active: boolean;
  variantId: string; // ID de la variante del producto para agregar al carrito
}

// Configuración completa del arreglo
interface ArrangementConfiguration {
  base: ComponentItem | null;
  flowers: ComponentItem[];
  balloons: ComponentItem[];
  extras: ComponentItem[];
  timestamp: number; // Para expiración de 24h
}

// Item del carrito (interfaz existente extendida con metadata)
interface ICartItem {
  variantId: string;
  productId: string;
  name: string;
  color: string;
  storage: string;
  price: number;
  quantity: number;
  image: string;
  // Metadata para arreglos personalizados
  arrangementGroupId?: string; // Identificador único del arreglo
  isArrangementComponent?: boolean; // Flag para identificar componentes de arreglo
  componentCategory?: ComponentCategory; // Categoría del componente
}
```

### Component Responsibilities

#### ArrangementBuilder (Page)
- Layout principal de la página
- Coordina ComponentSelector, PreviewCanvas, PriceCalculator y ConfigurationActions
- Maneja responsive design (mobile/tablet/desktop)

#### ComponentSelector
- Muestra componentes disponibles por categoría
- Permite selección/deselección
- Indica visualmente componentes seleccionados
- En mobile: usa pestañas o acordeón colapsable

#### PreviewCanvas
- Renderiza composición visual del arreglo
- Muestra capas de componentes (base → flores → globos → extras)
- Mantiene proporciones coherentes
- Muestra mensaje cuando no hay base seleccionada

#### PriceCalculator
- Calcula suma de precios de componentes seleccionados
- Formatea precio en moneda local
- Actualiza en tiempo real

#### ConfigurationActions
- Botón "REINICIAR DISEÑO" con confirmación
- Botón "Agregar al Carrito" (deshabilitado si no hay base)
- Genera `arrangement_group_id` único (UUID)
- Agrega cada componente seleccionado al `useCartStore`
- Incluye metadata de agrupación en cada item
- Muestra confirmación y limpia configuración tras agregar exitosamente

### Hooks

#### useArrangementComponents
```typescript
function useArrangementComponents(category?: ComponentCategory) {
  // Carga componentes activos desde Supabase
  // Filtra por category = 'componente-arreglo' AND active = true
  // Si se especifica category, filtra también por component_category
  // Ordena por campo component_order
  // Mapea productos a ComponentItem incluyendo variantId
  return { components, isLoading, error };
}
```

#### useArrangementConfig
```typescript
function useArrangementConfig() {
  // Sincroniza store con localStorage
  // Maneja expiración de 24 horas
  // Restaura configuración al montar
  return { saveConfig, loadConfig, clearConfig };
}
```

#### useArrangementCart
```typescript
function useArrangementCart() {
  // Hook personalizado para agregar arreglos al carrito
  // Genera arrangementGroupId único
  // Convierte configuración a array de ICartItem
  // Agrega cada item al useCartStore con metadata
  // Maneja errores de integración con carrito
  return { addArrangementToCart, isAdding, error };
}
```

## Data Models

### Database Schema Extensions

Extendemos la tabla `products` existente con campos adicionales para componentes de arreglos:

```sql
-- Campos adicionales en tabla products
ALTER TABLE products 
  ADD COLUMN component_category TEXT CHECK (component_category IN ('BASE', 'FLORES', 'GLOBOS', 'EXTRAS')),
  ADD COLUMN component_order INTEGER DEFAULT 0;

-- Índice para consultas eficientes
CREATE INDEX idx_products_component_category ON products(component_category) 
  WHERE category = 'componente-arreglo' AND active = true;
```

### Product as Component Mapping

Los componentes se almacenan como productos con:
- `category`: 'componente-arreglo' (identifica que es un componente)
- `component_category`: 'BASE' | 'FLORES' | 'GLOBOS' | 'EXTRAS'
- `component_order`: número para ordenar visualización
- `variants[0].price`: precio del componente
- `variants[0].id`: variantId usado para agregar al carrito
- `images[0]`: imagen principal del componente
- `name`: nombre del componente
- `active`: campo existente para activar/desactivar

### Cart Item Metadata

Cuando se agregan componentes al carrito, cada item incluye metadata adicional:

```typescript
{
  variantId: string,           // ID de la variante del producto
  productId: string,           // ID del producto
  name: string,                // Nombre del componente
  color: string,               // Valor por defecto o de la variante
  storage: string,             // Valor por defecto o de la variante
  price: number,               // Precio del componente
  quantity: 1,                 // Siempre 1 para componentes de arreglo
  image: string,               // Imagen del componente
  arrangementGroupId: string,  // UUID único del arreglo
  isArrangementComponent: true,
  componentCategory: ComponentCategory
}
```

El `arrangementGroupId` permite:
- Identificar qué items pertenecen al mismo arreglo
- Agrupar visualmente en el carrito y checkout
- Mantener la relación entre componentes durante el proceso de compra

### LocalStorage Schema

```typescript
// Clave: 'arrangement_config'
interface StoredConfiguration {
  version: 1;
  data: ArrangementConfiguration;
  expiresAt: number; // timestamp
}
```

## Correctness Properties


*Una propiedad es una característica o comportamiento que debe mantenerse verdadero en todas las ejecuciones válidas de un sistema - esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre especificaciones legibles por humanos y garantías de correctitud verificables por máquinas.*

### Property 1: Validación de campos requeridos en componentes

*Para cualquier* intento de crear un componente, si falta alguno de los campos requeridos (nombre, categoría, precio, imagen), el sistema debe rechazar la creación y mantener el estado actual sin cambios.

**Validates: Requirements 1.2**

### Property 2: Componentes desactivados persisten en base de datos

*Para cualquier* componente existente, cuando se desactiva, el componente debe seguir existiendo en la base de datos con su flag `active` en false, sin eliminarse.

**Validates: Requirements 1.3**

### Property 3: Componentes desactivados no aparecen en selección

*Para cualquier* consulta de componentes disponibles, ningún componente con `active = false` debe aparecer en los resultados retornados al cliente.

**Validates: Requirements 1.4**

### Property 4: Exclusividad de selección de base

*Para cualquier* configuración de arreglo, debe haber exactamente 0 o 1 base seleccionada, nunca más de una base simultáneamente.

**Validates: Requirements 2.2**

### Property 5: Reemplazo de base

*Para cualquier* par de bases (base_A, base_B), si base_A está seleccionada y el usuario selecciona base_B, entonces la configuración resultante debe contener solo base_B y no base_A.

**Validates: Requirements 2.4**

### Property 6: Selección múltiple de flores

*Para cualquier* conjunto de flores disponibles, el sistema debe permitir que todas estén seleccionadas simultáneamente sin restricciones de cantidad.

**Validates: Requirements 3.2**

### Property 7: Selección múltiple de globos

*Para cualquier* conjunto de globos disponibles, el sistema debe permitir que todos estén seleccionados simultáneamente sin restricciones de cantidad.

**Validates: Requirements 4.2**

### Property 8: Selección múltiple de extras

*Para cualquier* conjunto de extras disponibles, el sistema debe permitir que todos estén seleccionados simultáneamente sin restricciones de cantidad.

**Validates: Requirements 5.2**

### Property 9: Preview muestra todos los componentes seleccionados

*Para cualquier* configuración de arreglo, el preview canvas debe mostrar exactamente todos los componentes que están seleccionados (base, flores, globos, extras) y ningún componente que no esté seleccionado.

**Validates: Requirements 2.3, 3.3, 3.4, 4.3, 4.4, 5.3, 5.4, 6.1**

### Property 10: Orden de capas en preview

*Para cualquier* configuración con múltiples tipos de componentes, el preview debe renderizar las capas en el orden: base (fondo) → flores → globos → extras (frente).

**Validates: Requirements 6.4**

### Property 11: Cálculo de precio total

*Para cualquier* configuración de arreglo, el precio total calculado debe ser exactamente igual a la suma de los precios de todos los componentes seleccionados (base + flores + globos + extras).

**Validates: Requirements 2.5, 3.5, 4.5, 5.5, 7.1**

### Property 12: Formato de moneda

*Para cualquier* precio calculado, el valor mostrado debe estar formateado con el símbolo de moneda configurado del sistema y con el formato numérico correcto (separadores de miles y decimales).

**Validates: Requirements 7.4**

### Property 13: Reinicio limpia configuración

*Para cualquier* configuración de arreglo, cuando el usuario confirma el reinicio, el estado resultante debe tener base = null, flores = [], globos = [], extras = [], y precio total = 0.

**Validates: Requirements 8.3, 8.4, 8.5**

### Property 14: Validación de configuración

*Para cualquier* configuración de arreglo, la configuración es válida si y solo si tiene una base seleccionada (base !== null). La presencia o ausencia de flores, globos o extras no afecta la validez.

**Validates: Requirements 10.1, 10.3**

### Property 15: Error al agregar sin base

*Para cualquier* intento de agregar al carrito cuando la configuración no tiene base seleccionada, el sistema debe mostrar un mensaje de error y no agregar items al carrito.

**Validates: Requirements 9.2, 10.2**

### Property 16: Agregar componentes al carrito

*Para cualquier* configuración válida (con base), al presionar "Agregar al Carrito", el sistema debe agregar cada componente seleccionado como un item separado al carrito, todos con el mismo `arrangementGroupId` único.

**Validates: Requirements 9.3, 9.4, 13.1, 13.2**

### Property 17: Limpieza tras agregar al carrito

*Para cualquier* configuración guardada, cuando el usuario completa exitosamente la acción de agregar al carrito, el sistema debe limpiar tanto el store como el localStorage (sin configuración guardada).

**Validates: Requirements 9.5, 11.3**

### Property 18: Persistencia round trip

*Para cualquier* configuración de arreglo, si se guarda en localStorage y luego se recupera, la configuración recuperada debe ser equivalente a la original (mismos componentes seleccionados en cada categoría).

**Validates: Requirements 11.1, 11.2**

### Property 19: Limpieza de localStorage al reiniciar

*Para cualquier* configuración guardada, cuando el usuario confirma el reinicio del diseño, el localStorage debe quedar vacío (sin configuración guardada).

**Validates: Requirements 11.4**

### Property 20: Expiración de configuración guardada

*Para cualquier* configuración guardada en localStorage, si han transcurrido más de 24 horas desde el timestamp de guardado, al intentar restaurarla el sistema debe tratarla como expirada y no restaurar la configuración.

**Validates: Requirements 11.5**

### Property 21: Filtrado de componentes activos

*Para cualquier* consulta de componentes desde la base de datos, los resultados deben incluir solo productos donde `category = 'componente-arreglo'` AND `active = true`, excluyendo todos los demás productos.

**Validates: Requirements 1.4, 12.4**

### Property 22: Metadata de agrupación en items del carrito

*Para cualquier* conjunto de componentes agregados al carrito desde el constructor, todos los items deben tener el mismo `arrangementGroupId` y el flag `isArrangementComponent = true`.

**Validates: Requirements 13.2, 13.3**

### Property 23: Cantidad fija de componentes en carrito

*Para cualquier* componente de arreglo agregado al carrito, la cantidad debe ser siempre 1 (no se permite modificar cantidad de componentes individuales).

**Validates: Requirements 13.4**

## Error Handling

### Component Loading Errors

**Scenario**: Fallo al cargar componentes desde Supabase
- **Detection**: Hook `useArrangementComponents` detecta error en la respuesta
- **Response**: Mostrar mensaje de error amigable al usuario
- **Recovery**: Botón "Reintentar" para volver a cargar componentes
- **Fallback**: Permitir continuar con componentes ya cargados si es un error parcial

### LocalStorage Errors

**Scenario**: Fallo al leer/escribir en localStorage (cuota excedida, permisos)
- **Detection**: Try-catch en operaciones de localStorage
- **Response**: Log del error, continuar sin persistencia
- **User Impact**: Advertencia discreta que la configuración no se guardará automáticamente
- **Fallback**: Sistema funciona normalmente sin persistencia

### Invalid Configuration State

**Scenario**: Estado inconsistente en el store (ej: múltiples bases seleccionadas)
- **Detection**: Validación en selectores del store
- **Response**: Corregir automáticamente al estado válido más cercano
- **Logging**: Registrar inconsistencia para debugging
- **Prevention**: Validación estricta en todas las acciones del store

### Cart Integration Errors

**Scenario**: Fallo al agregar items al carrito
- **Detection**: Try-catch en llamada a `useCartStore.addItem`
- **Response**: Mostrar mensaje de error con opción de reintentar
- **Fallback**: Mantener configuración actual para que usuario pueda reintentar
- **User Impact**: Usuario puede reintentar o contactar soporte
- **Logging**: Registrar error con detalles de configuración para debugging

### Image Loading Errors

**Scenario**: Imagen de componente no carga en preview
- **Detection**: Event handler `onError` en elementos `<img>`
- **Response**: Mostrar placeholder con nombre del componente
- **Fallback**: Permitir continuar con selección aunque imagen no cargue
- **User Impact**: Funcionalidad completa, solo afecta visualización

### Network Timeout

**Scenario**: Timeout al cargar componentes
- **Detection**: Timeout configurado en cliente Supabase
- **Response**: Mensaje de error con opción de reintentar
- **Retry Strategy**: Exponential backoff (1s, 2s, 4s)
- **Max Retries**: 3 intentos antes de mostrar error final

### Invalid Product Data

**Scenario**: Producto marcado como componente sin campos requeridos
- **Detection**: Validación al cargar componentes
- **Response**: Filtrar componentes inválidos, log warning
- **User Impact**: Componentes inválidos no aparecen en selector
- **Admin Notification**: Sistema debe notificar a admin sobre productos mal configurados

## Testing Strategy

### Dual Testing Approach

El sistema utilizará una estrategia de testing dual que combina:

1. **Unit Tests**: Para casos específicos, ejemplos concretos y condiciones de borde
2. **Property-Based Tests**: Para verificar propiedades universales a través de múltiples inputs generados

Ambos tipos de tests son complementarios y necesarios para cobertura completa.

### Unit Testing Focus

Los unit tests se enfocarán en:

- **Ejemplos específicos**: 
  - Cargar componentes de categoría BASE muestra solo bases activas (Req 2.1)
  - Configuración con solo base es válida (Req 10.3)
  - Preview sin base muestra mensaje indicativo (Req 6.3)
  - Precio sin componentes muestra cero (Req 7.5)
  - Agregar al carrito con base válida crea items con mismo `arrangementGroupId` (Req 13.2)

- **Casos de borde**:
  - Componente con precio = 0
  - Configuración con todos los campos opcionales vacíos
  - localStorage lleno (cuota excedida)
  - Componente sin imagen
  - Producto sin variantes
  - Carrito lleno al intentar agregar arreglo

- **Integración entre componentes**:
  - Store sincroniza correctamente con localStorage
  - Preview reacciona a cambios en el store
  - PriceCalculator actualiza cuando cambia selección
  - Items se agregan correctamente al `useCartStore`
  - Metadata de agrupación se preserva en el carrito

- **Manejo de errores**:
  - Error de red al cargar componentes
  - localStorage no disponible
  - Imagen de componente no carga
  - Fallo al agregar al carrito
  - Producto mal configurado (sin component_category)

### Property-Based Testing

Utilizaremos **fast-check** como librería de property-based testing para TypeScript.

**Configuración**:
- Mínimo 100 iteraciones por test de propiedad
- Cada test debe referenciar su propiedad del documento de diseño
- Tag format: `Feature: arma-tu-arreglo, Property {number}: {property_text}`

**Generadores necesarios**:

```typescript
// Generador de ComponentItem
const arbComponentItem = (category: ComponentCategory) => 
  fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    category: fc.constant(category),
    price: fc.float({ min: 0, max: 10000, noNaN: true }),
    image: fc.webUrl(),
    order: fc.integer({ min: 0, max: 100 }),
    active: fc.boolean(),
    variantId: fc.uuid() // Agregado para integración con carrito
  });

// Generador de configuración de arreglo
const arbArrangementConfig = fc.record({
  base: fc.option(arbComponentItem('BASE'), { nil: null }),
  flowers: fc.array(arbComponentItem('FLORES'), { maxLength: 10 }),
  balloons: fc.array(arbComponentItem('GLOBOS'), { maxLength: 10 }),
  extras: fc.array(arbComponentItem('EXTRAS'), { maxLength: 10 })
});

// Generador de configuración válida (con base)
const arbValidConfig = arbArrangementConfig.filter(config => config.base !== null);

// Generador de ICartItem con metadata de arreglo
const arbArrangementCartItem = (groupId: string, category: ComponentCategory) =>
  fc.record({
    variantId: fc.uuid(),
    productId: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    color: fc.string({ minLength: 1, maxLength: 20 }),
    storage: fc.string({ minLength: 1, maxLength: 20 }),
    price: fc.float({ min: 0, max: 10000, noNaN: true }),
    quantity: fc.constant(1), // Siempre 1 para componentes
    image: fc.webUrl(),
    arrangementGroupId: fc.constant(groupId),
    isArrangementComponent: fc.constant(true),
    componentCategory: fc.constant(category)
  });
```

**Propiedades a implementar**:

Cada una de las 23 propiedades de correctitud definidas en este documento debe tener un test de propiedad correspondiente. Por ejemplo:

```typescript
// Property 11: Cálculo de precio total
test('Feature: arma-tu-arreglo, Property 11: Precio total es suma de componentes', () => {
  fc.assert(
    fc.property(arbArrangementConfig, (config) => {
      const expectedTotal = 
        (config.base?.price || 0) +
        config.flowers.reduce((sum, f) => sum + f.price, 0) +
        config.balloons.reduce((sum, b) => sum + b.price, 0) +
        config.extras.reduce((sum, e) => sum + e.price, 0);
      
      const calculatedTotal = calculateTotalPrice(config);
      
      expect(calculatedTotal).toBeCloseTo(expectedTotal, 2);
    }),
    { numRuns: 100 }
  );
});

// Property 22: Metadata de agrupación en items del carrito
test('Feature: arma-tu-arreglo, Property 22: Items tienen mismo arrangementGroupId', () => {
  fc.assert(
    fc.property(arbValidConfig, (config) => {
      const groupId = generateArrangementGroupId();
      const cartItems = convertConfigToCartItems(config, groupId);
      
      // Todos los items deben tener el mismo groupId
      const allHaveSameGroupId = cartItems.every(
        item => item.arrangementGroupId === groupId
      );
      
      // Todos deben estar marcados como componentes de arreglo
      const allMarkedAsArrangement = cartItems.every(
        item => item.isArrangementComponent === true
      );
      
      expect(allHaveSameGroupId).toBe(true);
      expect(allMarkedAsArrangement).toBe(true);
    }),
    { numRuns: 100 }
  );
});
```

### Integration Testing

- **Flujo completo**: Usuario selecciona componentes → visualiza preview → calcula precio → agrega al carrito → verifica items en carrito
- **Persistencia**: Configuración se guarda → página se recarga → configuración se restaura
- **Validación**: Intento de agregar sin base → error → agregar base → agregar exitoso
- **Agrupación en carrito**: Agregar arreglo → verificar que items tienen mismo `arrangementGroupId` → items se muestran agrupados
- **Integración con formulario**: Admin crea producto como componente → componente aparece en constructor → cliente puede seleccionarlo

### E2E Testing

Casos críticos para testing end-to-end:

1. Admin crea componente desde FormProduct → componente aparece en constructor
2. Usuario construye arreglo completo y agrega al carrito → procede a checkout
3. Usuario reinicia diseño y comienza de nuevo
4. Usuario cierra navegador y vuelve, configuración se restaura
5. Configuración expira después de 24 horas
6. Usuario agrega múltiples arreglos al carrito → cada uno tiene su propio `arrangementGroupId`

### Test Coverage Goals

- **Unit tests**: >80% cobertura de líneas
- **Property tests**: 100% de propiedades de correctitud implementadas (23 propiedades)
- **Integration tests**: Todos los flujos principales cubiertos, incluyendo integración con carrito
- **E2E tests**: Casos críticos de usuario cubiertos, incluyendo flujo admin → cliente

