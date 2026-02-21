# Documento de Diseño Técnico: Rediseño de Iconos del Navbar

## Overview

Este diseño técnico especifica la implementación del rediseño del navbar de la aplicación, enfocándose en reorganizar los iconos de acción (búsqueda, cuenta y carrito) en el lado derecho, eliminar etiquetas de texto redundantes, y reposicionar el contador del carrito como un badge.

El rediseño busca crear una interfaz más limpia y compacta sin comprometer la funcionalidad existente. Los cambios son principalmente visuales y de estructura DOM, manteniendo toda la lógica de negocio y gestión de estado intacta.

### Objetivos del Diseño

1. Agrupar todos los iconos de acción en el lado derecho del navbar
2. Reducir el ruido visual eliminando etiquetas de texto innecesarias
3. Mejorar la jerarquía visual con un badge para el contador del carrito
4. Mantener la accesibilidad mediante tooltips informativos
5. Preservar el diseño responsivo y la funcionalidad existente

### Alcance

**Incluye:**
- Modificación del componente `Navbar.tsx` para reorganizar iconos
- Implementación de tooltips para iconos de cuenta y carrito
- Reposicionamiento del contador del carrito como badge
- Ajustes de estilos CSS para el nuevo layout
- Verificación de compatibilidad responsive

**No incluye:**
- Cambios en la funcionalidad de búsqueda, carrito o autenticación
- Modificaciones al componente `NavbarMobile.tsx`
- Cambios en los stores de Zustand
- Alteraciones a los componentes `Cart.tsx` o `Search.tsx`

## Architecture

### Componentes Afectados

El rediseño afecta principalmente al componente `Navbar.tsx` ubicado en `src/components/shared/Navbar.tsx`. Este componente es responsable de renderizar la barra de navegación principal en dispositivos desktop y tablet.

### Estructura Actual vs Propuesta

**Estructura Actual:**
```
<nav>
  <Logo />
  <SearchBar /> (desktop only)
  <NavLinks />
  <SearchIcon /> (mobile only)
  <AccountIcon + "Cuenta" text />
  <CartButton + "Carrito" text + counter />
  <HamburgerMenu /> (mobile only)
</nav>
```

**Estructura Propuesta:**
```
<nav>
  <Logo />
  <NavLinks />
  <ActionIconsGroup>
    <SearchIcon />
    <AccountIcon + tooltip />
    <CartIconWithBadge + tooltip + counter badge />
  </ActionIconsGroup>
  <HamburgerMenu /> (mobile only)
</nav>
```

### Cambios Arquitectónicos

1. **Eliminación del SearchBar Desktop**: La barra de búsqueda dedicada en desktop se elimina, unificando la experiencia con un solo icono de búsqueda que abre el sheet
2. **Agrupación de Iconos de Acción**: Los tres iconos (búsqueda, cuenta, carrito) se agrupan visualmente en el lado derecho
3. **Badge Pattern**: El contador del carrito se implementa como un badge posicionado absolutamente sobre el icono

### Dependencias

- **React Icons**: `HiOutlineSearch`, `HiOutlineShoppingBag`, `HiOutlineUser`
- **Zustand Stores**: `useGlobalStore` (para sheets), `useCartStore` (para contador)
- **React Router**: `Link` para navegación
- **Tailwind CSS**: Para estilos y responsive design
- **Hooks personalizados**: `useUser`, `useCustomer` (sin cambios)

## Components and Interfaces

### Navbar Component

**Ubicación**: `src/components/shared/Navbar.tsx`

**Props**: Ninguna (el componente no recibe props)

**State Interno**:
- `openDropdownId: number | null` - ID del dropdown actualmente abierto (sin cambios)

**Hooks Utilizados**:
```typescript
const openSheet = useGlobalStore(state => state.openSheet);
const totalItemsInCart = useCartStore(state => state.totalItemsInCart);
const setActiveNavMobile = useGlobalStore(state => state.setActiveNavMobile);
const { session, isLoading } = useUser();
const { data: customer } = useCustomer(userId);
```

### Action Icons Group

Este no es un componente separado, sino una agrupación lógica dentro del JSX del Navbar. Se implementa como un `<div>` con clases de Tailwind para layout flex.

**Estructura**:
```tsx
<div className="flex items-center gap-4">
  {/* Search Icon */}
  {/* Account Icon */}
  {/* Cart Icon with Badge */}
  {/* Hamburger Menu (mobile) */}
</div>
```

### Search Icon Component

**Implementación**:
```tsx
<button
  onClick={() => openSheet('search')}
  className="flex items-center justify-center w-10 h-10 rounded-full text-slate-700 hover:text-primary hover:bg-primary/10 transition-colors"
  title="Buscar"
>
  <HiOutlineSearch size={22} />
</button>
```

**Características**:
- Botón circular con hover effect
- Abre el sheet de búsqueda al hacer click
- Visible en todas las resoluciones
- Tooltip nativo con atributo `title`

### Account Icon Component

**Implementación**:
```tsx
{isLoading ? (
  <LuLoader2 className="animate-spin text-primary" size={26} />
) : session ? (
  <Link
    to="/account"
    className="flex items-center justify-center w-10 h-10 rounded-full text-slate-700 hover:text-primary hover:bg-primary/10 transition-colors"
    title="Cuenta"
  >
    {customer?.full_name ? (
      <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary bg-white text-xs font-bold text-primary shadow-sm">
        {customer.full_name[0]}
      </span>
    ) : (
      <HiOutlineUser size={22} />
    )}
  </Link>
) : (
  <Link
    to="/login"
    className="flex items-center justify-center w-10 h-10 rounded-full text-slate-700 hover:text-primary hover:bg-primary/10 transition-colors"
    title="Cuenta"
  >
    <HiOutlineUser size={22} />
  </Link>
)}
```

**Características**:
- Muestra loader mientras carga la sesión
- Muestra inicial del nombre si el usuario está autenticado y tiene nombre
- Muestra icono genérico si no hay nombre o no está autenticado
- Tooltip con texto "Cuenta"
- Sin etiqueta de texto visible

### Cart Icon with Badge Component

**Implementación**:
```tsx
<button
  className="relative flex items-center justify-center w-10 h-10 rounded-full text-slate-700 hover:text-primary hover:bg-primary/10 transition-colors"
  onClick={() => openSheet('cart')}
  title="Carrito"
>
  <HiOutlineShoppingBag size={22} />
  {totalItemsInCart > 0 && (
    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
      {totalItemsInCart}
    </span>
  )}
</button>
```

**Características**:
- Botón circular con hover effect
- Badge posicionado en esquina superior derecha
- Badge solo visible cuando `totalItemsInCart > 0`
- Badge circular con fondo primary y texto blanco
- Tooltip con texto "Carrito"
- Sin etiqueta de texto visible

## Data Models

No se requieren cambios en los modelos de datos existentes. El rediseño utiliza las mismas interfaces y tipos:

### Interfaces Existentes (sin cambios)

```typescript
// De useCartStore
interface CartState {
  items: ICartItem[];
  totalItemsInCart: number;
  totalAmount: number;
  // ... métodos
}

// De useGlobalStore
interface GlobalState {
  isSheetOpen: boolean;
  sheetContent: 'cart' | 'search' | null;
  activeNavMobile: boolean;
  // ... métodos
}

// De useUser
interface Session {
  user: {
    id: string;
    // ... otros campos
  };
}

// De useCustomer
interface Customer {
  full_name: string;
  // ... otros campos
}
```

## Correctness Properties

*Una propiedad (property) es una característica o comportamiento que debe mantenerse verdadero en todas las ejecuciones válidas de un sistema - esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre las especificaciones legibles por humanos y las garantías de corrección verificables por máquinas.*

### Property 1: Search Icon Opens Search Sheet

*Para cualquier* estado del navbar, cuando el usuario hace click en el icono de búsqueda, el sistema debe llamar a `openSheet('search')` y abrir el panel de búsqueda.

**Validates: Requirements 1.3**

### Property 2: Action Icons Display Tooltips on Hover

*Para cualquier* icono de acción (cuenta o carrito), cuando el usuario pasa el cursor sobre el icono, el sistema debe mostrar un tooltip con el texto descriptivo apropiado ("Cuenta" o "Carrito").

**Validates: Requirements 2.4, 2.5**

### Property 3: Cart Counter Visibility Based on Items

*Para cualquier* valor de `totalItemsInCart`, el badge del contador debe estar visible si y solo si el valor es mayor a cero.

**Validates: Requirements 3.3, 3.4**

### Property 4: Cart Counter Updates Reactively

*Para cualquier* cambio en el estado del carrito (agregar, remover, actualizar cantidad), el contador del carrito debe reflejar el nuevo valor de `totalItemsInCart` inmediatamente.

**Validates: Requirements 3.5**

### Property 5: Action Icons Visible Across Resolutions

*Para cualquier* tamaño de viewport (mobile, tablet, desktop), los iconos de acción (búsqueda, cuenta, carrito) deben estar presentes y visibles en el DOM.

**Validates: Requirements 4.1, 4.5**

### Property 6: Navigation Dropdowns Remain Functional

*Para cualquier* link de navegación con dropdown, hacer click en el botón debe alternar la visibilidad del menú dropdown correctamente.

**Validates: Requirements 5.3**

### Property 7: Zustand Store Integration Preserved

*Para cualquier* interacción que requiera el store (abrir sheets, acceder al contador del carrito), las funciones del store deben ser llamadas correctamente y el estado debe actualizarse.

**Validates: Requirements 5.5**

## Error Handling

### Casos de Error Potenciales

1. **Usuario no autenticado**: Ya manejado por la lógica existente que muestra el icono genérico y redirige a `/login`
2. **Customer data no disponible**: Ya manejado mostrando el icono genérico en lugar de la inicial
3. **totalItemsInCart undefined o null**: Se maneja con el operador `>` que evalúa a false para valores falsy

### Estrategia de Error Handling

No se requieren cambios en el manejo de errores. El componente ya maneja correctamente:
- Estados de carga con el loader
- Ausencia de sesión
- Ausencia de datos del customer
- Valores undefined/null del contador

### Validaciones

No se requieren validaciones adicionales. Las validaciones existentes son suficientes:
- El store de Zustand garantiza que `totalItemsInCart` sea siempre un número
- Los hooks `useUser` y `useCustomer` manejan sus propios estados de error
- React Router maneja la navegación de forma segura

## Testing Strategy

### Enfoque Dual de Testing

Este feature requiere tanto unit tests como property-based tests para garantizar corrección completa:

- **Unit tests**: Verificarán ejemplos específicos de estructura DOM, estilos CSS, y casos edge
- **Property tests**: Verificarán comportamientos universales de interacción y reactividad

### Unit Testing

**Framework**: Vitest + React Testing Library

**Casos de Test Unitarios**:

1. **Estructura y Posicionamiento**:
   - Verificar que el icono de búsqueda esté en el grupo de iconos de acción
   - Verificar el orden: Search → Account → Cart
   - Verificar que el logo esté a la izquierda
   - Verificar que los nav links estén en el centro

2. **Estilos y Clases CSS**:
   - Verificar que el navbar tenga clases `sticky`, `backdrop-blur-md`
   - Verificar que el badge tenga posicionamiento absoluto
   - Verificar que el badge sea circular
   - Verificar clases responsive en diferentes breakpoints

3. **Texto y Etiquetas**:
   - Verificar que NO exista texto "Cuenta" visible en desktop
   - Verificar que NO exista texto "Carrito" visible
   - Verificar que existan atributos `title` con los textos apropiados

4. **Casos Edge**:
   - Carrito vacío (totalItemsInCart = 0): badge no visible
   - Usuario no autenticado: icono genérico
   - Usuario autenticado sin nombre: icono genérico
   - Usuario autenticado con nombre: inicial visible

5. **Responsive Design**:
   - Viewport < 768px: verificar que hamburger menu esté visible
   - Viewport >= 768px: verificar que nav links estén visibles
   - Todos los viewports: iconos de acción visibles

### Property-Based Testing

**Framework**: fast-check (para JavaScript/TypeScript)

**Configuración**: Mínimo 100 iteraciones por test

**Property Tests**:

1. **Property 1: Search Icon Opens Search Sheet**
   ```typescript
   // Feature: navbar-icons-redesign, Property 1: Para cualquier estado del navbar, 
   // cuando el usuario hace click en el icono de búsqueda, el sistema debe llamar 
   // a openSheet('search')
   ```
   - Generar: diferentes estados del navbar (dropdowns abiertos/cerrados, usuario autenticado/no)
   - Acción: simular click en el icono de búsqueda
   - Verificar: que se llame a `openSheet` con argumento `'search'`

2. **Property 2: Action Icons Display Tooltips**
   ```typescript
   // Feature: navbar-icons-redesign, Property 2: Para cualquier icono de acción, 
   // cuando el usuario pasa el cursor sobre el icono, el sistema debe mostrar 
   // un tooltip con el texto descriptivo apropiado
   ```
   - Generar: diferentes iconos de acción (cuenta, carrito)
   - Acción: simular hover sobre cada icono
   - Verificar: que el atributo `title` contenga el texto correcto

3. **Property 3: Cart Counter Visibility**
   ```typescript
   // Feature: navbar-icons-redesign, Property 3: Para cualquier valor de 
   // totalItemsInCart, el badge debe estar visible si y solo si el valor es mayor a cero
   ```
   - Generar: valores aleatorios de `totalItemsInCart` (0, 1, 5, 99, 100+)
   - Acción: renderizar el navbar con cada valor
   - Verificar: badge visible ↔ totalItemsInCart > 0

4. **Property 4: Cart Counter Updates Reactively**
   ```typescript
   // Feature: navbar-icons-redesign, Property 4: Para cualquier cambio en el estado 
   // del carrito, el contador debe reflejar el nuevo valor inmediatamente
   ```
   - Generar: secuencias aleatorias de operaciones del carrito (add, remove, update)
   - Acción: ejecutar cada operación
   - Verificar: que el contador mostrado coincida con `totalItemsInCart` del store

5. **Property 5: Action Icons Visible Across Resolutions**
   ```typescript
   // Feature: navbar-icons-redesign, Property 5: Para cualquier tamaño de viewport, 
   // los iconos de acción deben estar presentes y visibles
   ```
   - Generar: diferentes tamaños de viewport (320px, 768px, 1024px, 1920px)
   - Acción: renderizar el navbar en cada tamaño
   - Verificar: que los tres iconos estén en el DOM y no tengan `display: none`

6. **Property 6: Navigation Dropdowns Remain Functional**
   ```typescript
   // Feature: navbar-icons-redesign, Property 6: Para cualquier link con dropdown, 
   // hacer click debe alternar la visibilidad correctamente
   ```
   - Generar: diferentes links con dropdown del array `navbarLinks`
   - Acción: simular click en el botón del dropdown
   - Verificar: que el dropdown se abra/cierre correctamente

7. **Property 7: Zustand Store Integration Preserved**
   ```typescript
   // Feature: navbar-icons-redesign, Property 7: Para cualquier interacción que 
   // requiera el store, las funciones deben ser llamadas correctamente
   ```
   - Generar: diferentes interacciones (abrir search, abrir cart, abrir mobile menu)
   - Acción: ejecutar cada interacción
   - Verificar: que se llamen las funciones correctas del store con los argumentos correctos

### Integration Testing

**Casos de Integración**:

1. **Flujo completo de búsqueda**:
   - Click en icono de búsqueda → Sheet se abre → Búsqueda funciona → Sheet se cierra

2. **Flujo completo de carrito**:
   - Agregar item → Contador se actualiza → Click en icono → Sheet se abre con items

3. **Flujo de autenticación**:
   - Usuario no autenticado → Click en cuenta → Redirige a login
   - Usuario autenticado → Click en cuenta → Redirige a account

### Visual Regression Testing

**Herramienta sugerida**: Chromatic o Percy

**Casos de Visual Testing**:
1. Navbar en desktop (1920px)
2. Navbar en tablet (768px)
3. Navbar en mobile (375px)
4. Navbar con carrito vacío
5. Navbar con carrito con items
6. Navbar con usuario autenticado (con inicial)
7. Navbar con usuario autenticado (sin inicial)
8. Navbar con usuario no autenticado
9. Navbar con dropdown abierto

### Criterios de Aceptación de Tests

- **Cobertura de código**: Mínimo 90% en el componente Navbar.tsx
- **Property tests**: Todas las propiedades deben pasar 100 iteraciones sin fallos
- **Unit tests**: Todos los casos edge deben estar cubiertos
- **Visual tests**: No debe haber regresiones visuales en ningún viewport
- **Integration tests**: Todos los flujos principales deben funcionar end-to-end
