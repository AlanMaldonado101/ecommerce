# Plan de Implementación: Arma tu Arreglo

## Descripción General

Este plan implementa las integraciones finales del sistema "Arma tu Arreglo" con la infraestructura existente de la aplicación. La funcionalidad principal del constructor ya está implementada. Este documento se enfoca en:

1. Integración con el formulario de productos (FormProduct.tsx) - **YA COMPLETADO**
2. Integración con el carrito de compras (useCartStore, Cart.tsx, CartItem.tsx)
3. Mejoras en la visualización del carrito para arreglos agrupados

## Estado Actual

- ✅ Migración de base de datos completada (007_arrangement_components.sql)
- ✅ Interfaces TypeScript definidas (arrangement.interface.ts)
- ✅ Store de Zustand implementado (arrangement.store.ts)
- ✅ Hooks implementados (useArrangementComponents, useArrangementConfig)
- ✅ Componentes UI implementados (ComponentSelector, PreviewCanvas, PriceCalculator)
- ✅ Página principal implementada (ArrangementBuilder.tsx)
- ✅ FormProduct.tsx extendido con campos de componente de arreglo
- ⚠️ ConfigurationActions.tsx usa WhatsApp (necesita cambiar a carrito)
- ⚠️ Cart.tsx y CartItem.tsx no muestran agrupación de arreglos

## Tareas Pendientes

- [ ] 1. Extender interfaz ICartItem con metadata de arreglos
  - Modificar `src/components/shared/CartItem.tsx` para agregar campos opcionales a la interfaz `ICartItem`
  - Agregar campos: `arrangementGroupId?: string`, `isArrangementComponent?: boolean`, `componentCategory?: ComponentCategory`
  - Importar tipo `ComponentCategory` desde `src/interfaces/arrangement.interface.ts`
  - _Requirements: 13.2, 13.3_

- [ ]* 1.1 Escribir property test para metadata de agrupación
  - **Property 22: Metadata de agrupación en items del carrito**
  - **Valida: Requirements 13.2, 13.3**

- [ ] 2. Crear hook useArrangementCart para integración con carrito
  - Crear archivo `src/hooks/useArrangementCart.ts`
  - Implementar función `addArrangementToCart` que:
    - Genera un `arrangementGroupId` único usando UUID v4
    - Convierte la configuración actual en array de `ICartItem`
    - Agrega cada componente al `useCartStore` con metadata de agrupación
    - Incluye `arrangementGroupId`, `isArrangementComponent: true`, `componentCategory`
  - Retornar `{ addArrangementToCart, isAdding, error }`
  - Implementar manejo de errores de integración con carrito
  - _Requirements: 9.3, 9.4, 13.1, 13.2, 13.3_

- [ ]* 2.1 Escribir property test para agregar componentes al carrito
  - **Property 16: Agregar componentes al carrito**
  - **Valida: Requirements 9.3, 9.4, 13.1, 13.2**

- [ ]* 2.2 Escribir property test para cantidad fija de componentes
  - **Property 23: Cantidad fija de componentes en carrito**
  - **Valida: Requirements 13.4**

- [ ]* 2.3 Escribir unit tests para useArrangementCart
  - Test: todos los items tienen el mismo `arrangementGroupId`
  - Test: todos los items tienen `isArrangementComponent: true`
  - Test: cantidad de cada componente es siempre 1
  - Test: manejo de error al agregar al carrito
  - _Requirements: 13.2, 13.3, 13.4_

- [ ] 3. Actualizar ConfigurationActions para usar carrito
  - Modificar `src/components/arrangement-builder/ConfigurationActions.tsx`
  - Remover lógica de generación de mensaje de WhatsApp
  - Importar y usar hook `useArrangementCart`
  - Cambiar botón "Pedir por WhatsApp" a "Agregar al Carrito"
  - Al presionar botón, llamar a `addArrangementToCart()` con la configuración actual
  - Mostrar confirmación exitosa tras agregar al carrito
  - Limpiar configuración del store y localStorage tras agregar exitosamente
  - Mantener validación: botón deshabilitado si no hay base seleccionada
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.2, 10.4, 11.3_

- [ ]* 3.1 Escribir property test para limpieza tras agregar al carrito
  - **Property 17: Limpieza tras agregar al carrito**
  - **Valida: Requirements 9.5, 11.3**

- [ ]* 3.2 Escribir unit tests para ConfigurationActions actualizado
  - Test: botón "Agregar al Carrito" deshabilitado sin base
  - Test: mensaje de error al intentar agregar sin base
  - Test: configuración se limpia tras agregar exitosamente
  - Test: confirmación se muestra tras agregar al carrito
  - _Requirements: 10.4, 10.2, 9.5_

- [ ] 4. Extender CartItem para mostrar componentes de arreglo
  - Modificar `src/components/shared/CartItem.tsx`
  - Detectar si el item es componente de arreglo mediante `isArrangementComponent`
  - Si es componente de arreglo:
    - Ocultar controles de cantidad (no permitir modificar cantidad)
    - Mostrar badge con la categoría del componente (BASE, FLORES, GLOBOS, EXTRAS)
    - Mantener botón "Eliminar" pero con advertencia de que eliminará todo el arreglo
  - Si no es componente de arreglo, mantener comportamiento actual
  - _Requirements: 13.4, 13.5_

- [ ]* 4.1 Escribir unit tests para CartItem extendido
  - Test: componente de arreglo no muestra controles de cantidad
  - Test: componente de arreglo muestra badge de categoría
  - Test: producto regular mantiene controles de cantidad
  - _Requirements: 13.4_

- [ ] 5. Extender Cart para agrupar arreglos visualmente
  - Modificar `src/components/shared/Cart.tsx`
  - Implementar lógica para agrupar items por `arrangementGroupId`
  - Renderizar arreglos agrupados con estructura visual:
    ```
    🌸 Arreglo Personalizado
      ├─ Base: [nombre] - $[precio]
      ├─ Flores: [nombre] - $[precio]
      ├─ Globo: [nombre] - $[precio]
      └─ Extra: [nombre] - $[precio]
      Total del arreglo: $[suma]
    ```
  - Agregar botón "Eliminar arreglo completo" que remueve todos los items del grupo
  - Mantener renderizado normal para productos que no son componentes de arreglo
  - Calcular y mostrar subtotal de cada arreglo agrupado
  - _Requirements: 13.5_

- [ ]* 5.1 Escribir integration tests para visualización de arreglos en carrito
  - Test: items con mismo `arrangementGroupId` se muestran agrupados
  - Test: subtotal del arreglo se calcula correctamente
  - Test: eliminar arreglo completo remueve todos los items del grupo
  - Test: productos regulares y arreglos se muestran correctamente juntos
  - _Requirements: 13.5_

- [ ] 6. Checkpoint - Verificar integración completa
  - Ejecutar todos los tests (unit, property, integration)
  - Probar flujo completo: seleccionar componentes → agregar al carrito → ver carrito → verificar agrupación
  - Probar agregar múltiples arreglos al carrito (cada uno con su propio `arrangementGroupId`)
  - Probar mezclar productos regulares y arreglos en el carrito
  - Verificar que eliminar arreglo completo funcione correctamente
  - Verificar que la configuración se limpie tras agregar al carrito
  - Preguntar al usuario si hay ajustes necesarios

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requirements específicos para trazabilidad
- Los checkpoints aseguran validación incremental del progreso
- Los property tests validan propiedades universales de correctitud
- Los unit tests validan casos específicos y condiciones de borde
- La implementación usa TypeScript, React, Zustand, Supabase y fast-check para property testing

## Cambios Principales vs Diseño Original

1. **Integración con carrito**: Se reemplaza el flujo de WhatsApp por agregar componentes al carrito de compras existente
2. **Metadata de agrupación**: Cada item del carrito incluye `arrangementGroupId`, `isArrangementComponent` y `componentCategory`
3. **Visualización agrupada**: El carrito muestra arreglos personalizados agrupados visualmente con subtotales
4. **FormProduct ya extendido**: Los campos `component_category` y `component_order` ya están implementados en el formulario

## Archivos a Modificar

- `src/components/shared/CartItem.tsx` - Extender interfaz ICartItem y lógica de renderizado
- `src/components/shared/Cart.tsx` - Agregar lógica de agrupación visual
- `src/components/arrangement-builder/ConfigurationActions.tsx` - Cambiar de WhatsApp a carrito
- `src/hooks/useArrangementCart.ts` - Nuevo hook para integración con carrito
