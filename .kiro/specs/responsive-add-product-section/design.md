# Documento de Diseño Técnico

## Introducción

Este documento define el diseño técnico para implementar un sistema responsive completo en la sección de añadir productos del dashboard administrativo. La solución se enfoca en adaptar el formulario existente y todos sus componentes para proporcionar una experiencia óptima en dispositivos móviles (< 768px), tablets (768px - 1024px) y escritorio (> 1024px), utilizando Tailwind CSS y manteniendo toda la funcionalidad actual.

## Arquitectura

### Estrategia de Diseño Responsive

La implementación seguirá el enfoque **mobile-first** de Tailwind CSS, donde:

1. **Estilos base**: Se definen para mobile viewport (< 768px)
2. **Breakpoints progresivos**: Se aplican modificadores `md:` (≥768px) y `lg:` (≥1024px) para tablets y escritorio
3. **Grid adaptativo**: El layout principal usa CSS Grid con columnas que se adaptan según el viewport
4. **Componentes modulares**: Cada componente maneja su propia responsividad internamente

### Breakpoints del Proyecto

Basado en la configuración de Tailwind (usando valores por defecto):

- **Mobile**: `< 768px` (sin prefijo)
- **Tablet**: `≥ 768px` (prefijo `md:`)
- **Desktop**: `≥ 1024px` (prefijo `lg:`)

### Componentes Afectados

```
FormProduct (componente principal)
├── Header y navegación
├── Action Buttons (Cancelar/Guardar)
├── SectionFormProduct (contenedor de secciones)
├── InputForm (campos de entrada)
├── CategorySelect / SubcategorySelect
├── VariantsInput (gestión de variantes)
├── UploaderImages (carga de imágenes)
├── Editor (texto enriquecido)
├── TagsInput (etiquetas)
├── OccasionsInput (temáticas)
└── Sección de costos
```

## Componentes y Interfaces

### 1. FormProduct (Componente Principal)

**Cambios en el Layout Principal**

El grid principal actualmente usa:
```tsx
className='grid auto-rows-max flex-1 grid-cols-1 gap-6 lg:grid-cols-3'
```

**Modificaciones necesarias**:
- Mobile: `grid-cols-1` (ya implementado)
- Tablet: Agregar `md:grid-cols-2` para layout de 2 columnas
- Desktop: Mantener `lg:grid-cols-3`

**Clase final**:
```tsx
className='grid auto-rows-max flex-1 grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6'
```

### 2. Header y Navegación

**Estado actual**:
```tsx
<div className='flex items-center justify-between'>
  <div className='space-y-1'>
    <div className='flex items-center gap-3'>
      <button>...</button>
      <h1 className='text-2xl font-extrabold tracking-tight'>
        {titleForm}
      </h1>
    </div>
    <p className='text-xs font-medium uppercase tracking-[0.22em] text-slate-400'>
      ...breadcrumb...
    </p>
  </div>
  <div className='hidden gap-3 md:flex'>
    ...botones de acción...
  </div>
</div>
```

**Modificaciones**:
- Reducir tamaño del título en mobile: `text-xl md:text-2xl`
- Ajustar gap del botón back: `gap-2 md:gap-3`
- Hacer breadcrumb más compacto: `text-[10px] md:text-xs`
- Permitir wrap del título si es muy largo: agregar `flex-wrap`

### 3. Action Buttons (Botones de Acción)

**Implementación actual**:
- Desktop: Botones en el header (visible con `hidden md:flex`)
- Mobile: Botones al final del formulario (visible con `md:hidden`)

**Mejoras necesarias**:
- Hacer botones full-width en mobile
- Agregar padding inferior para evitar que el teclado los tape
- Considerar sticky positioning en mobile para acceso rápido

**Clase propuesta para contenedor mobile**:
```tsx
className='mt-4 flex flex-col gap-3 pb-safe md:hidden sm:flex-row'
```

### 4. SectionFormProduct

**Estado actual**:
```tsx
className='flex h-fit flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-primary/5'
```

**Modificaciones**:
- Reducir padding en mobile: `p-4 md:p-5 lg:p-6`
- Reducir gap interno: `gap-3 md:gap-4`
- Ajustar border radius: `rounded-xl md:rounded-2xl`
- Reducir tamaño del ícono y título en mobile

**Título de sección**:
```tsx
<h2 className='text-xs md:text-sm font-extrabold uppercase tracking-[0.15em] md:tracking-[0.18em] text-slate-500'>
```

### 5. InputForm

**Modificaciones necesarias**:
- Asegurar touch targets mínimos de 44px
- Ajustar tamaño de fuente: `text-sm md:text-base`
- Padding táctil: `py-2.5 md:py-2`
- Labels más compactos en mobile

**Grids de inputs**:
Cambiar de:
```tsx
className='grid gap-4 md:grid-cols-2'
```
A:
```tsx
className='grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2'
```

### 6. VariantsInput

**Problema actual**: Usa `grid-cols-6` que no funciona en mobile

**Solución**: Cambiar a layout de tarjetas en mobile

**Estructura propuesta**:

```tsx
// Mobile: Stack vertical de tarjetas
// Desktop: Grid de 6 columnas (actual)

// Contenedor de variante
<div className='flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 md:grid md:grid-cols-6 md:items-center md:gap-4 md:border-0 md:bg-transparent md:p-0'>
  {/* Cada input con su label en mobile */}
  <div className='flex flex-col gap-1 md:contents'>
    <label className='text-xs font-medium text-slate-600 md:hidden'>Stock</label>
    <input {...} />
  </div>
  {/* Repetir para cada campo */}
</div>
```

**Headers**: Ocultar en mobile, mostrar en desktop
```tsx
<div className='hidden md:grid md:grid-cols-6 justify-start gap-4'>
```

**Paleta de colores**: Mantener grid flexible
```tsx
className='flex flex-wrap gap-2'
```

### 7. UploaderImages

**Estado actual**:
```tsx
<div className='mt-4 grid grid-cols-4 gap-4 lg:grid-cols-2'>
```

**Problema**: En mobile, 4 columnas es demasiado

**Solución**:
```tsx
<div className='mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-2 md:gap-4'>
```

**Tamaño de thumbnails**:
```tsx
className='relative h-24 w-full rounded-lg border border-slate-200 bg-white p-1 shadow-sm md:h-20 lg:h-28'
```

**Área de drop**:
- Reducir padding vertical en mobile: `py-6 md:py-8`
- Ajustar tamaños de texto

### 8. Editor (Rich Text)

**Toolbar actual**:
```tsx
<div className='flex flex-wrap gap-3'>
```

**Mejoras**:
- Reducir gap en mobile: `gap-2 md:gap-3`
- Reducir tamaño de botones: `w-7 h-6 md:w-8 md:h-7`
- Ajustar tamaño de texto: `text-xs md:text-sm`

**Área de edición**:
```tsx
editorProps: {
  attributes: {
    class: 'focus:outline-none min-h-[120px] md:min-h-[150px] prose prose-sm'
  }
}
```

### 9. Sección SEO

**URL Preview**:
```tsx
<div className='flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 overflow-x-auto'>
  <span className='whitespace-nowrap text-[10px] md:text-xs'>
    tienditajireh.com/p/
  </span>
  <span className='truncate font-semibold text-slate-800 text-[10px] md:text-xs'>
    {watch('slug')}
  </span>
</div>
```

**Grid de campos SEO**:
```tsx
<div className='grid gap-4 grid-cols-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]'>
```

### 10. Sección de Costos

**Grid actual**:
```tsx
<div className='grid gap-3 md:grid-cols-2'>
```

**Mejora**: Agregar especificación explícita para mobile
```tsx
<div className='grid gap-3 grid-cols-1 md:grid-cols-2'>
```

**Inputs numéricos**: Agregar `inputMode="numeric"` para teclado móvil
```tsx
<input
  type='number'
  inputMode='numeric'
  pattern='[0-9]*'
  {...}
/>
```

### 11. OccasionsInput (Creación Inline)

**Botón "Crear Temática"**:
```tsx
<button
  type='button'
  className='ml-2 shrink-0 rounded-md border border-primary/30 px-2 py-1 text-[10px] md:px-3 md:text-xs font-medium text-primary transition-colors hover:bg-primary/10'
>
  + Crear Temática
</button>
```

**Formulario inline**:
```tsx
<div className='mt-2 flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/5 p-2 md:flex-row md:w-fit'>
  <input
    type='text'
    className='w-full md:w-48 rounded-md border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary'
  />
  <button
    type='button'
    className='rounded-md bg-primary px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-primary/90'
  >
    Crear
  </button>
</div>
```

## Data Models

No se requieren cambios en los modelos de datos. La implementación es puramente de presentación (CSS/Tailwind).

### Tipos TypeScript Existentes

```typescript
interface ProductFormValues {
  name: string;
  slug: string;
  category: string;
  subcategory_id: string;
  provider_id: string;
  tags: string[];
  occasion_ids: string[];
  description: JSONContent;
  images: (File | string)[];
  variants: Variant[];
  features: string[];
}

interface Variant {
  id?: string;
  stock: number;
  price: number;
  priceWholesale: number;
  storage: string;
  color: string;
  colorName: string;
}
```

Estos tipos permanecen sin cambios.


## Correctness Properties

*Una propiedad es una característica o comportamiento que debe ser verdadero en todas las ejecuciones válidas de un sistema, esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre las especificaciones legibles por humanos y las garantías de corrección verificables por máquinas.*

### Reflexión sobre Propiedades

Después de analizar los criterios de aceptación, he identificado las siguientes áreas de redundancia y consolidación:

**Redundancias identificadas**:

1. **Layout de Grid por Viewport**: Los criterios 1.1, 1.2 y 1.3 verifican el mismo comportamiento (adaptación del grid) en diferentes viewports. Estos se pueden consolidar en una sola propiedad que verifique que el grid se adapta correctamente según el ancho del viewport.

2. **Touch Targets**: Los criterios 3.1 y 12.1 verifican lo mismo (tamaño mínimo de 44x44px para elementos interactivos). Se consolidarán en una sola propiedad.

3. **Funcionalidad Preservada**: Los criterios 4.3, 5.3, 6.3, 8.3, 9.3 y 10.3 verifican que la funcionalidad se mantiene en todos los viewports. Estos se pueden agrupar en propiedades más específicas por componente.

4. **Stacking Vertical en Mobile**: Los criterios 3.2, 7.1, 9.1 y 10.4 verifican que elementos se apilen verticalmente en mobile. Se pueden consolidar en una propiedad general sobre grids.

**Propiedades consolidadas**:

Después de la reflexión, las propiedades finales son:

### Property 1: Grid Layout Adaptation

*For any* viewport width, the main form grid SHALL display 1 column when width < 768px, 2 columns when 768px ≤ width < 1024px, and 3 columns when width ≥ 1024px

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Interactive Elements Touch Target Size

*For any* interactive element (buttons, inputs, selects) rendered on mobile viewport (< 768px), the element SHALL have a minimum height of 44px and minimum width of 44px (or full width for inputs)

**Validates: Requirements 3.1, 12.1**

### Property 3: Multi-Column Grids Stack Vertically on Mobile

*For any* grid layout with multiple columns (input grids, cost section, SEO fields), when rendered on mobile viewport (< 768px), the grid SHALL display as a single column (grid-cols-1 or flex-col)

**Validates: Requirements 3.2, 7.1, 9.1, 10.4**

### Property 4: Labels Remain Associated with Inputs

*For any* input field across all viewport sizes, the input SHALL have an associated label that is visible and properly linked (via htmlFor/id or aria-label)

**Validates: Requirements 3.3**

### Property 5: Variant Management Functionality Preservation

*For any* viewport size, the VariantsInput component SHALL maintain the ability to add new variants, edit existing variant fields, and remove variants through interactive buttons

**Validates: Requirements 4.3**

### Property 6: Image Grid Responsiveness

*For any* viewport width, the image uploader grid SHALL display 2 columns when width < 768px, 3 columns when 768px ≤ width < 1024px, and 2 columns when width ≥ 1024px

**Validates: Requirements 5.1**

### Property 7: Image Control Touch Targets

*For any* image thumbnail on mobile viewport (< 768px), the delete button SHALL have a minimum touch target size of 44x44px

**Validates: Requirements 5.2**

### Property 8: Image Upload Functionality Preservation

*For any* viewport size, the image uploader SHALL accept and display multiple image files when selected through the file input

**Validates: Requirements 5.3**

### Property 9: Rich Text Editor Toolbar Fits Viewport

*For any* viewport width, the rich text editor toolbar SHALL not cause horizontal overflow and SHALL wrap buttons when necessary using flex-wrap

**Validates: Requirements 6.1, 6.2**

### Property 10: Rich Text Editor Formatting Preservation

*For any* viewport size, the rich text editor SHALL maintain all formatting capabilities (bold, italic, strike, headings H1-H3) through clickable toolbar buttons

**Validates: Requirements 6.3**

### Property 11: Character Counters Visibility

*For any* text input with character counter (meta title, meta description) on mobile viewport (< 768px), the counter SHALL be visible and positioned near its associated input

**Validates: Requirements 7.2**

### Property 12: Tags Wrap and Maintain Functionality

*For any* number of tags in the tags input on mobile viewport (< 768px), the tags SHALL wrap to multiple lines without overflow and maintain add/remove functionality

**Validates: Requirements 7.4**

### Property 13: Breadcrumb No Overflow

*For any* breadcrumb text length on mobile viewport (< 768px), the breadcrumb navigation SHALL not cause horizontal overflow (using truncate or wrap)

**Validates: Requirements 8.2**

### Property 14: Back Navigation Functionality

*For any* viewport size, the back button in the header SHALL trigger navigation to the previous page when clicked

**Validates: Requirements 8.3**

### Property 15: Long Title Handling

*For any* page title length on mobile viewport (< 768px), the title SHALL either truncate with ellipsis or wrap to multiple lines without causing layout overflow

**Validates: Requirements 8.4**

### Property 16: Price Calculation Preservation

*For any* viewport size, when cost and margin values are entered, the suggested price SHALL be calculated and displayed in real-time using the formula: cost × (1 + margin/100)

**Validates: Requirements 9.3**

### Property 17: Occasion Button Touch Target

*For any* mobile viewport (< 768px), the "Crear Temática" button SHALL have adequate touch target size (minimum 44px height) and SHALL not cause horizontal overflow

**Validates: Requirements 10.2**

### Property 18: Occasion Creation Functionality

*For any* viewport size, the inline occasion creation form SHALL allow entering a name and creating a new occasion that gets added to the selected occasions list

**Validates: Requirements 10.3**

### Property 19: Upload Visual Feedback

*For any* image upload operation on mobile viewport (< 768px), the interface SHALL provide visual feedback (loading state, progress indicator, or immediate preview) during the upload process

**Validates: Requirements 11.3**

### Property 20: Interactive Elements Spacing

*For any* two adjacent interactive elements on mobile viewport (< 768px), there SHALL be a minimum spacing of 8px between them to prevent accidental taps

**Validates: Requirements 12.2**


## Error Handling

### Viewport Detection

**Estrategia**: Usar media queries de Tailwind CSS que son manejadas por el navegador

- No requiere JavaScript para detección de viewport
- Los breakpoints son estándar y confiables
- Fallback automático a estilos base (mobile-first)

**Casos de error**:
- Si CSS no carga: El HTML semántico mantiene la funcionalidad básica
- Si JavaScript falla: Los estilos responsive siguen funcionando (son CSS puro)

### Componentes con Estado

**VariantsInput**:
- **Error**: No se puede agregar variante
  - **Manejo**: Mostrar mensaje de error del formulario (ya implementado con react-hook-form)
  - **Responsive**: El mensaje de error se muestra debajo del botón en mobile

**UploaderImages**:
- **Error**: Imagen demasiado grande (> 5MB)
  - **Manejo**: Validar tamaño antes de crear preview
  - **Responsive**: Toast notification visible en todos los viewports
  
- **Error**: Formato de imagen no soportado
  - **Manejo**: Validar extensión antes de procesar
  - **Responsive**: Mensaje de error adaptado al ancho disponible

**Editor**:
- **Error**: Contenido vacío al enviar
  - **Manejo**: Validación de react-hook-form muestra error
  - **Responsive**: Mensaje de error visible debajo del editor en mobile

**OccasionsInput**:
- **Error**: Nombre de temática vacío
  - **Manejo**: Toast error con mensaje claro (ya implementado)
  - **Responsive**: Toast se posiciona correctamente en mobile
  
- **Error**: Error de red al crear temática
  - **Manejo**: Toast error con mensaje del servidor
  - **Responsive**: Mantener formulario inline abierto para reintentar

### Validación de Formulario

**Estrategia**: Usar react-hook-form con zod schema (ya implementado)

**Responsive considerations**:
- Mensajes de error se muestran debajo de cada campo
- En mobile, los mensajes tienen suficiente espacio (no se solapan)
- Color rojo (#EF4444) con buen contraste en todos los viewports
- Tamaño de texto: `text-xs` (12px) legible en mobile

### Manejo de Teclado Virtual (Mobile)

**Problema**: El teclado virtual puede tapar campos de entrada

**Solución**:
- Los navegadores modernos ajustan el viewport automáticamente
- Los botones de acción al final del formulario quedan accesibles al hacer scroll
- No se usa `position: fixed` en elementos críticos que puedan quedar tapados

**Inputs numéricos**:
- Usar `inputMode="numeric"` para mostrar teclado numérico
- Usar `type="number"` para validación HTML5
- Fallback: Si el navegador no soporta inputMode, type="number" sigue funcionando

## Testing Strategy

### Enfoque Dual de Testing

La estrategia de testing combina:

1. **Unit Tests**: Para casos específicos, ejemplos concretos y condiciones de borde
2. **Property-Based Tests**: Para propiedades universales que deben cumplirse con cualquier entrada

Ambos tipos de tests son complementarios y necesarios para cobertura completa.

### Property-Based Testing

**Librería**: `@fast-check/vitest` (para proyectos React/TypeScript con Vitest)

**Configuración**:
```typescript
import { test } from 'vitest';
import { fc } from '@fast-check/vitest';

// Cada test debe ejecutar mínimo 100 iteraciones
fc.configureGlobal({ numRuns: 100 });
```

**Generadores Personalizados**:

```typescript
// Generador de anchos de viewport
const viewportWidth = () => fc.integer({ min: 320, max: 1920 });

// Generador de viewport categories
const mobileViewport = () => fc.integer({ min: 320, max: 767 });
const tabletViewport = () => fc.integer({ min: 768, max: 1023 });
const desktopViewport = () => fc.integer({ min: 1024, max: 1920 });

// Generador de variantes
const variant = () => fc.record({
  stock: fc.integer({ min: 0, max: 1000 }),
  price: fc.float({ min: 0, max: 10000, noNaN: true }),
  priceWholesale: fc.float({ min: 0, max: 10000, noNaN: true }),
  storage: fc.string({ minLength: 1, maxLength: 50 }),
  color: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`),
  colorName: fc.string({ minLength: 1, maxLength: 20 })
});

// Generador de imágenes
const imageFile = () => fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }).map(s => `${s}.jpg`),
  size: fc.integer({ min: 1, max: 5 * 1024 * 1024 }), // hasta 5MB
  type: fc.constantFrom('image/jpeg', 'image/png', 'image/webp')
});

// Generador de títulos de diferentes longitudes
const pageTitle = () => fc.string({ minLength: 5, maxLength: 100 });
```

**Tests de Propiedades**:

Cada propiedad del documento de diseño debe tener un test correspondiente:

```typescript
// Feature: responsive-add-product-section, Property 1: Grid Layout Adaptation
test.prop([mobileViewport()])('grid displays 1 column on mobile', (width) => {
  const { container } = render(<FormProduct titleForm="Test" />);
  setViewportWidth(width);
  const grid = container.querySelector('form');
  expect(getComputedColumns(grid)).toBe(1);
});

// Feature: responsive-add-product-section, Property 2: Interactive Elements Touch Target Size
test.prop([mobileViewport()])('interactive elements have min 44px touch target', (width) => {
  const { container } = render(<FormProduct titleForm="Test" />);
  setViewportWidth(width);
  const buttons = container.querySelectorAll('button');
  buttons.forEach(button => {
    const rect = button.getBoundingClientRect();
    expect(rect.height).toBeGreaterThanOrEqual(44);
  });
});

// Feature: responsive-add-product-section, Property 5: Variant Management Functionality Preservation
test.prop([viewportWidth(), fc.array(variant(), { minLength: 0, maxLength: 10 })])(
  'can add, edit, and remove variants at any viewport',
  async (width, initialVariants) => {
    setViewportWidth(width);
    const { getByText, getAllByRole } = render(<FormProduct titleForm="Test" />);
    
    // Test add
    const addButton = getByText('Añadir Variante');
    await userEvent.click(addButton);
    expect(getAllByRole('textbox').length).toBeGreaterThan(0);
    
    // Test remove
    const removeButtons = getAllByRole('button', { name: /remove/i });
    if (removeButtons.length > 0) {
      await userEvent.click(removeButtons[0]);
      expect(getAllByRole('textbox').length).toBeLessThan(initialVariants.length);
    }
  }
);

// Feature: responsive-add-product-section, Property 16: Price Calculation Preservation
test.prop([
  viewportWidth(),
  fc.float({ min: 1, max: 10000, noNaN: true }),
  fc.float({ min: 0, max: 999, noNaN: true })
])('calculates suggested price correctly at any viewport', async (width, cost, margin) => {
  setViewportWidth(width);
  const { getByLabelText, getByText } = render(<FormProduct titleForm="Test" />);
  
  const costInput = getByLabelText(/costo unitario/i);
  const marginInput = getByLabelText(/ganancia/i);
  
  await userEvent.type(costInput, cost.toString());
  await userEvent.type(marginInput, margin.toString());
  
  const expected = cost * (1 + margin / 100);
  expect(getByText(expected.toFixed(2))).toBeInTheDocument();
});
```

**Configuración de Tests**: Mínimo 100 iteraciones por test

```typescript
// En el archivo de configuración de vitest
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
});
```

### Unit Testing

**Librería**: Vitest + React Testing Library (ya en uso en el proyecto)

**Casos específicos a testear**:

1. **Action Buttons Position**:
```typescript
// Ejemplo específico: botones en header en desktop
test('action buttons appear in header on desktop', () => {
  setViewportWidth(1200);
  const { container } = render(<FormProduct titleForm="Test" />);
  const headerButtons = container.querySelector('.hidden.md\\:flex');
  expect(headerButtons).toBeInTheDocument();
  expect(headerButtons).toHaveClass('md:flex');
});

// Ejemplo específico: botones al final en mobile
test('action buttons appear at bottom on mobile', () => {
  setViewportWidth(375);
  const { container } = render(<FormProduct titleForm="Test" />);
  const mobileButtons = container.querySelector('.md\\:hidden');
  expect(mobileButtons).toBeInTheDocument();
});
```

2. **Variant Card Layout**:
```typescript
// Ejemplo específico: variante como tarjeta en mobile
test('variant displays as vertical card on mobile', () => {
  setViewportWidth(375);
  const { container } = render(<VariantsInput {...props} />);
  const variantCard = container.querySelector('.flex-col');
  expect(variantCard).toHaveClass('flex-col');
  expect(variantCard).toHaveClass('md:grid');
});
```

3. **Editor Toolbar Wrap**:
```typescript
// Ejemplo específico: toolbar hace wrap
test('editor toolbar wraps buttons', () => {
  const { container } = render(<Editor {...props} />);
  const toolbar = container.querySelector('.flex-wrap');
  expect(toolbar).toHaveClass('flex-wrap');
});
```

4. **Numeric Keyboard Trigger**:
```typescript
// Ejemplo específico: input tiene inputMode numeric
test('cost input has numeric inputMode', () => {
  const { getByLabelText } = render(<FormProduct titleForm="Test" />);
  const costInput = getByLabelText(/costo unitario/i);
  expect(costInput).toHaveAttribute('inputMode', 'numeric');
  expect(costInput).toHaveAttribute('type', 'number');
});
```

5. **Lazy Loading**:
```typescript
// Ejemplo específico: componente se carga lazy
test('editor component is lazy loaded', async () => {
  const { findByRole } = render(<FormProduct titleForm="Test" />);
  // Verificar que el editor no está en el DOM inicial
  expect(screen.queryByRole('textbox', { name: /descripción/i })).not.toBeInTheDocument();
  
  // Scroll hasta la sección de descripción
  scrollToSection('description');
  
  // Verificar que ahora sí está
  const editor = await findByRole('textbox', { name: /descripción/i });
  expect(editor).toBeInTheDocument();
});
```

### Integration Testing

**Casos de integración**:

1. **Flujo completo de creación de producto en mobile**:
```typescript
test('can create product from mobile viewport', async () => {
  setViewportWidth(375);
  const { getByLabelText, getByText } = render(<FormProduct titleForm="Agregar Producto" />);
  
  // Llenar formulario
  await userEvent.type(getByLabelText(/nombre/i), 'Producto Test');
  await userEvent.selectOptions(getByLabelText(/categoría/i), 'globos');
  
  // Agregar variante
  await userEvent.click(getByText('Añadir Variante'));
  await userEvent.type(getByLabelText(/stock/i), '10');
  await userEvent.type(getByLabelText(/precio/i), '100');
  
  // Subir imagen
  const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
  const input = getByLabelText(/arrastra imágenes/i);
  await userEvent.upload(input, file);
  
  // Guardar
  await userEvent.click(getByText('Guardar producto'));
  
  // Verificar que se llamó la mutación
  expect(mockCreateProduct).toHaveBeenCalled();
});
```

2. **Cambio de viewport durante edición**:
```typescript
test('preserves form state when viewport changes', async () => {
  const { getByLabelText, rerender } = render(<FormProduct titleForm="Test" />);
  
  // Llenar en desktop
  setViewportWidth(1200);
  await userEvent.type(getByLabelText(/nombre/i), 'Producto Test');
  
  // Cambiar a mobile
  setViewportWidth(375);
  rerender(<FormProduct titleForm="Test" />);
  
  // Verificar que el valor se mantiene
  expect(getByLabelText(/nombre/i)).toHaveValue('Producto Test');
});
```

### Visual Regression Testing (Opcional)

Para verificar que los cambios visuales son correctos:

**Herramienta**: Playwright con screenshots

```typescript
test('form renders correctly on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/dashboard/products/new');
  await expect(page).toHaveScreenshot('form-mobile.png');
});

test('form renders correctly on tablet', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/dashboard/products/new');
  await expect(page).toHaveScreenshot('form-tablet.png');
});

test('form renders correctly on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/dashboard/products/new');
  await expect(page).toHaveScreenshot('form-desktop.png');
});
```

### Cobertura de Testing

**Objetivo**: 
- Cobertura de código: > 80%
- Cobertura de propiedades: 100% (todas las propiedades deben tener su test)
- Cobertura de ejemplos: Casos críticos y edge cases

**Métricas**:
- 20 property-based tests (uno por cada propiedad)
- ~15-20 unit tests (ejemplos específicos y edge cases)
- 2-3 integration tests (flujos completos)
- 3 visual regression tests (opcional)

**Ejecución**:
```bash
# Tests unitarios y de propiedades
npm run test

# Tests con cobertura
npm run test:coverage

# Tests visuales (si se implementan)
npm run test:e2e
```

### Helpers de Testing

**Utilidades para tests responsive**:

```typescript
// src/tests/helpers/viewport.ts
export const setViewportWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
};

export const getComputedColumns = (element: HTMLElement): number => {
  const style = window.getComputedStyle(element);
  const gridTemplateColumns = style.gridTemplateColumns;
  return gridTemplateColumns.split(' ').length;
};

export const getTouchTargetSize = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
    meetsMinimum: rect.width >= 44 && rect.height >= 44,
  };
};

export const hasHorizontalOverflow = (element: HTMLElement): boolean => {
  return element.scrollWidth > element.clientWidth;
};
```

### Continuous Integration

**Pipeline de CI**:

1. Lint y type checking
2. Unit tests + Property tests
3. Integration tests
4. Visual regression tests (en PR)
5. Build de producción

**Configuración GitHub Actions**:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run build
```

