# Plan de Implementación: Responsive Add Product Section

## Descripción General

Este plan implementa un sistema responsive completo para la sección de añadir productos del dashboard administrativo. La implementación sigue un enfoque mobile-first usando Tailwind CSS, adaptando el formulario y todos sus componentes para proporcionar una experiencia óptima en dispositivos móviles (< 768px), tablets (768px - 1024px) y escritorio (> 1024px).

## Tareas

- [x] 1. Actualizar layout principal y estructura del formulario
  - Modificar el grid principal en FormProduct.tsx para usar `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
  - Ajustar gaps responsivos: `gap-4 md:gap-5 lg:gap-6`
  - Actualizar padding de SectionFormProduct: `p-4 md:p-5 lg:p-6`
  - Ajustar border radius: `rounded-xl md:rounded-2xl`
  - Reducir gaps internos de secciones: `gap-3 md:gap-4`
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Implementar header y navegación responsive
  - Ajustar tamaño del título: `text-xl md:text-2xl`
  - Reducir gap del botón back: `gap-2 md:gap-3`
  - Hacer breadcrumb más compacto: `text-[10px] md:text-xs`
  - Agregar flex-wrap al contenedor del título para títulos largos
  - Ajustar tamaño de íconos y títulos de sección: `text-xs md:text-sm`
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 3. Adaptar botones de acción para mobile y desktop
  - Mantener botones en header para desktop (clase existente `hidden md:flex`)
  - Actualizar contenedor mobile con: `mt-4 flex flex-col gap-3 pb-safe md:hidden sm:flex-row`
  - Hacer botones full-width en mobile con clases responsive
  - Agregar padding inferior para evitar que el teclado los tape
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 4. Hacer responsive los campos de entrada básicos
  - Ajustar tamaño de fuente de inputs: `text-sm md:text-base`
  - Asegurar padding táctil: `py-2.5 md:py-2`
  - Actualizar grids de inputs: `grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2`
  - Verificar que todos los inputs tengan touch targets mínimos de 44px en mobile
  - Asegurar que labels permanezcan visibles y asociados
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5. Refactorizar VariantsInput para layout responsive
  - [x] 5.1 Cambiar de grid de 6 columnas a layout de tarjetas en mobile
    - Implementar contenedor con: `flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 md:grid md:grid-cols-6 md:items-center md:gap-4 md:border-0 md:bg-transparent md:p-0`
    - Agregar labels inline para cada campo en mobile (ocultos en desktop con `md:hidden`)
    - Mantener grid de 6 columnas para desktop
    - _Requirements: 4.1, 4.2_
  
  - [x] 5.2 Ocultar headers de columnas en mobile
    - Agregar clase `hidden md:grid md:grid-cols-6` al contenedor de headers
    - _Requirements: 4.1_
  
  - [x] 5.3 Asegurar separación visual entre variantes en mobile
    - Verificar que cada tarjeta tenga border y padding adecuados
    - Mantener gap entre variantes: `gap-3 md:gap-4`
    - _Requirements: 4.4_

- [ ]* 5.4 Escribir test de propiedad para gestión de variantes
  - **Property 5: Variant Management Functionality Preservation**
  - **Valida: Requirements 4.3**

- [x] 6. Adaptar UploaderImages para diferentes viewports
  - Cambiar grid de imágenes: `grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-2 md:gap-4`
  - Ajustar tamaño de thumbnails: `h-24 md:h-20 lg:h-28`
  - Reducir padding del área de drop: `py-6 md:py-8`
  - Asegurar que controles de eliminar tengan touch targets de 44px en mobile
  - _Requirements: 5.1, 5.2, 5.4_

- [ ]* 6.1 Escribir tests de propiedad para el uploader de imágenes
  - **Property 6: Image Grid Responsiveness**
  - **Property 7: Image Control Touch Targets**
  - **Property 8: Image Upload Functionality Preservation**
  - **Valida: Requirements 5.1, 5.2, 5.3**

- [x] 7. Hacer responsive el Editor de texto enriquecido
  - Reducir gap del toolbar: `gap-2 md:gap-3`
  - Ajustar tamaño de botones: `w-7 h-6 md:w-8 md:h-7`
  - Reducir tamaño de texto: `text-xs md:text-sm`
  - Ajustar altura mínima del área de edición: `min-h-[120px] md:min-h-[150px]`
  - Verificar que el toolbar hace wrap con `flex-wrap`
  - _Requirements: 6.1, 6.2, 6.4_

- [ ]* 7.1 Escribir tests de propiedad para el editor
  - **Property 9: Rich Text Editor Toolbar Fits Viewport**
  - **Property 10: Rich Text Editor Formatting Preservation**
  - **Valida: Requirements 6.1, 6.2, 6.3**

- [x] 8. Adaptar sección de SEO para mobile
  - Actualizar grid de campos SEO: `grid gap-4 grid-cols-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]`
  - Ajustar tamaño de texto del URL preview: `text-[10px] md:text-xs`
  - Agregar `overflow-x-auto` al contenedor del preview
  - Asegurar que character counters sean visibles en mobile
  - Verificar que TagsInput hace wrap correctamente con `flex-wrap`
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ]* 8.1 Escribir tests de propiedad para sección SEO
  - **Property 11: Character Counters Visibility**
  - **Property 12: Tags Wrap and Maintain Functionality**
  - **Valida: Requirements 7.2, 7.4**

- [x] 9. Hacer responsive la sección de costos
  - Actualizar grid: `grid gap-3 grid-cols-1 md:grid-cols-2`
  - Agregar `inputMode="numeric"` y `pattern="[0-9]*"` a inputs numéricos
  - Ajustar display del precio sugerido para mobile
  - Verificar que el cálculo en tiempo real funciona en todos los viewports
  - _Requirements: 9.1, 9.2, 9.4_

- [ ]* 9.1 Escribir test de propiedad para cálculo de precios
  - **Property 16: Price Calculation Preservation**
  - **Valida: Requirements 9.3**

- [x] 10. Adaptar OccasionsInput y creación inline
  - Ajustar botón "Crear Temática": `px-2 py-1 text-[10px] md:px-3 md:text-xs`
  - Hacer formulario inline responsive: `flex flex-col gap-2 md:flex-row md:w-fit`
  - Ajustar ancho del input: `w-full md:w-48`
  - Asegurar que el botón tiene touch target adecuado en mobile
  - _Requirements: 10.1, 10.2_

- [ ]* 10.1 Escribir tests de propiedad para creación de temáticas
  - **Property 17: Occasion Button Touch Target**
  - **Property 18: Occasion Creation Functionality**
  - **Valida: Requirements 10.2, 10.3**

- [x] 11. Checkpoint - Verificar adaptación visual en todos los viewports
  - Probar el formulario en mobile (375px), tablet (768px) y desktop (1200px)
  - Verificar que no hay overflow horizontal en ningún viewport
  - Asegurar que todos los elementos interactivos son accesibles
  - Verificar que los grids se adaptan correctamente
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implementar optimizaciones de rendimiento para mobile
  - Verificar que el Editor se carga de forma lazy (ya implementado con React.lazy)
  - Agregar loading states visuales durante carga de imágenes
  - Asegurar que las interacciones son fluidas sin lag
  - _Requirements: 11.2, 11.3, 11.4_

- [ ]* 12.1 Escribir test de propiedad para feedback de upload
  - **Property 19: Upload Visual Feedback**
  - **Valida: Requirements 11.3**

- [x] 13. Verificar accesibilidad táctil en todos los componentes
  - Auditar que todos los elementos interactivos tienen mínimo 44x44px en mobile
  - Verificar spacing entre elementos interactivos (mínimo 8px)
  - Probar que dropdowns y selects funcionan bien con touch
  - Asegurar feedback visual claro en interacciones táctiles
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ]* 13.1 Escribir tests de propiedad para accesibilidad táctil
  - **Property 2: Interactive Elements Touch Target Size**
  - **Property 20: Interactive Elements Spacing**
  - **Valida: Requirements 12.1, 12.2**

- [ ] 14. Escribir tests de propiedades universales del layout
  - [ ]* 14.1 Escribir test para adaptación del grid principal
    - **Property 1: Grid Layout Adaptation**
    - **Valida: Requirements 1.1, 1.2, 1.3**
  
  - [ ]* 14.2 Escribir test para grids multi-columna en mobile
    - **Property 3: Multi-Column Grids Stack Vertically on Mobile**
    - **Valida: Requirements 3.2, 7.1, 9.1, 10.4**
  
  - [ ]* 14.3 Escribir test para asociación de labels
    - **Property 4: Labels Remain Associated with Inputs**
    - **Valida: Requirements 3.3**

- [ ] 15. Escribir tests de propiedades para navegación y breadcrumb
  - [ ]* 15.1 Escribir test para breadcrumb sin overflow
    - **Property 13: Breadcrumb No Overflow**
    - **Valida: Requirements 8.2**
  
  - [ ]* 15.2 Escribir test para navegación back
    - **Property 14: Back Navigation Functionality**
    - **Valida: Requirements 8.3**
  
  - [ ]* 15.3 Escribir test para manejo de títulos largos
    - **Property 15: Long Title Handling**
    - **Valida: Requirements 8.4**

- [ ] 16. Checkpoint final - Ejecutar suite completa de tests
  - Ejecutar todos los property-based tests (mínimo 100 iteraciones cada uno)
  - Ejecutar tests unitarios y de integración
  - Verificar cobertura de código (objetivo > 80%)
  - Verificar que todas las 20 propiedades tienen sus tests
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Integración y validación final
  - Probar flujo completo de creación de producto en mobile
  - Probar flujo completo de edición de producto en tablet
  - Verificar que el cambio de viewport durante edición preserva el estado
  - Probar con diferentes dispositivos reales si es posible
  - _Requirements: Todos_

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los property tests validan propiedades universales de corrección
- Los unit tests validan ejemplos específicos y casos de borde
- La implementación usa Tailwind CSS con enfoque mobile-first
- Todos los cambios son de presentación (CSS), sin modificar lógica de negocio
