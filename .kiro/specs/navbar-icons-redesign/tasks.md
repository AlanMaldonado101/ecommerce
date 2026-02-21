# Plan de Implementación: Rediseño de Iconos del Navbar

## Descripción General

Este plan implementa el rediseño del navbar reorganizando los iconos de acción (búsqueda, cuenta y carrito) en el lado derecho, eliminando etiquetas de texto redundantes, y reposicionando el contador del carrito como un badge. Los cambios son principalmente visuales y de estructura DOM, manteniendo toda la lógica de negocio intacta.

## Tareas

- [x] 1. Reorganizar estructura del navbar y agrupar iconos de acción
  - Eliminar la barra de búsqueda dedicada en desktop
  - Crear grupo de iconos de acción en el lado derecho
  - Reposicionar el icono de búsqueda al grupo de iconos
  - Mantener el orden: Logo → NavLinks → ActionIcons (Search, Account, Cart)
  - _Requisitos: 1.1, 1.2, 5.1, 5.2_

- [ ] 2. Implementar icono de búsqueda con tooltip
  - [x] 2.1 Crear botón circular para el icono de búsqueda
    - Implementar botón con `HiOutlineSearch` icon
    - Agregar estilos de hover (text-primary, bg-primary/10)
    - Conectar con `openSheet('search')` al hacer click
    - Agregar atributo `title="Buscar"` para tooltip nativo
    - _Requisitos: 1.1, 1.2, 1.3, 1.4_
  
  - [ ]* 2.2 Escribir property test para apertura del sheet de búsqueda
    - **Property 1: Search Icon Opens Search Sheet**
    - **Valida: Requisitos 1.3**

- [ ] 3. Modificar icono de cuenta eliminando texto y agregando tooltip
  - [x] 3.1 Actualizar componente de cuenta para mostrar solo icono
    - Eliminar texto "Cuenta" visible
    - Mantener lógica de loader, inicial del usuario, e icono genérico
    - Implementar botón circular con estilos consistentes
    - Agregar atributo `title="Cuenta"` para tooltip
    - _Requisitos: 2.1, 2.3, 2.4, 5.5_
  
  - [ ]* 3.2 Escribir property test para tooltips de iconos de acción
    - **Property 2: Action Icons Display Tooltips on Hover**
    - **Valida: Requisitos 2.4, 2.5**

- [x] 4. Checkpoint - Verificar estructura y tooltips
  - Asegurar que todos los tests pasen, preguntar al usuario si surgen dudas.

- [ ] 5. Implementar icono de carrito con badge y tooltip
  - [x] 5.1 Crear botón de carrito con badge posicionado
    - Eliminar texto "Carrito" visible
    - Implementar botón circular con `HiOutlineShoppingBag` icon
    - Crear badge circular en esquina superior derecha (-top-1, -right-1)
    - Badge con fondo primary, texto blanco, tamaño 20x20px
    - Mostrar badge solo cuando `totalItemsInCart > 0`
    - Agregar atributo `title="Carrito"` para tooltip
    - _Requisitos: 2.2, 2.3, 2.5, 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 5.2 Escribir property test para visibilidad del badge del carrito
    - **Property 3: Cart Counter Visibility Based on Items**
    - **Valida: Requisitos 3.3, 3.4**
  
  - [ ]* 5.3 Escribir property test para actualización reactiva del contador
    - **Property 4: Cart Counter Updates Reactively**
    - **Valida: Requisitos 3.5**

- [ ] 6. Ajustar estilos responsive y espaciado
  - [x] 6.1 Implementar estilos responsive para el grupo de iconos
    - Ajustar gap entre iconos (gap-4 en desktop, gap-2 en mobile)
    - Verificar que iconos sean visibles en todos los viewports
    - Mantener hamburger menu funcional en mobile
    - Preservar estilos sticky y backdrop-blur del navbar
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 5.4_
  
  - [ ]* 6.2 Escribir property test para visibilidad en diferentes resoluciones
    - **Property 5: Action Icons Visible Across Resolutions**
    - **Valida: Requisitos 4.1, 4.5**

- [ ] 7. Verificar preservación de funcionalidad existente
  - [x] 7.1 Validar integración con stores de Zustand
    - Verificar que `openSheet` funcione correctamente para search y cart
    - Verificar que `totalItemsInCart` se actualice reactivamente
    - Verificar que `setActiveNavMobile` funcione en mobile
    - _Requisitos: 5.5_
  
  - [ ]* 7.2 Escribir property test para funcionalidad de dropdowns
    - **Property 6: Navigation Dropdowns Remain Functional**
    - **Valida: Requisitos 5.3**
  
  - [ ]* 7.3 Escribir property test para integración con Zustand
    - **Property 7: Zustand Store Integration Preserved**
    - **Valida: Requisitos 5.5**

- [x] 8. Checkpoint final - Verificar todos los tests y funcionalidad
  - Asegurar que todos los tests pasen, preguntar al usuario si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los property tests validan propiedades de corrección universales
- Los unit tests validan ejemplos específicos y casos edge
- El diseño usa TypeScript/React, mantener consistencia con el código existente
