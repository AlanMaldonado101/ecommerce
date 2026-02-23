# Plan de Implementación

- [x] 1. Escribir test de exploración de condición de bug
  - **Property 1: Fault Condition** - Errores de Compilación TypeScript
  - **CRÍTICO**: Este test DEBE FALLAR en código sin corregir - la falla confirma que el bug existe
  - **NO intentar corregir el test o el código cuando falle**
  - **NOTA**: Este test codifica el comportamiento esperado - validará la corrección cuando pase después de la implementación
  - **OBJETIVO**: Exponer contraejemplos que demuestren que el bug existe
  - **Enfoque PBT Acotado**: Para bugs deterministas, acotar la propiedad a los casos concretos que fallan para asegurar reproducibilidad
  - Ejecutar `tsc -b` en el código sin corregir y capturar todos los mensajes de error
  - Verificar que los errores incluyen:
    - Errores de propiedad inexistente en consultas Supabase (arrangement.ts)
    - Errores de discrepancia de tipos en IDs de orden (order.ts)
    - Errores de propiedades faltantes en interfaz Order
    - Errores TS6133 de imports no utilizados
    - Errores de propiedad 'active' inexistente en tests
    - Errores de discrepancia Element/HTMLElement en tests
  - **RESULTADO ESPERADO**: Test FALLA (esto es correcto - prueba que el bug existe)
  - Documentar contraejemplos encontrados para entender la causa raíz
  - Marcar tarea completa cuando el test esté escrito, ejecutado, y la falla documentada
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2. Escribir tests de propiedad de preservación (ANTES de implementar la corrección)
  - **Property 2: Preservation** - Comportamiento en Tiempo de Ejecución Sin Cambios
  - **IMPORTANTE**: Seguir metodología de observación primero
  - Observar comportamiento en código SIN CORREGIR para entradas no afectadas por el bug
  - Ejecutar tests existentes que actualmente pasan y documentar su comportamiento
  - Verificar que la funcionalidad de consultas Supabase funciona correctamente cuando no hay errores de tipo
  - Verificar que el procesamiento de órdenes funciona correctamente con IDs válidos
  - Verificar que los componentes de arreglos funcionan correctamente
  - Escribir tests basados en propiedades capturando patrones de comportamiento observados
  - El testing basado en propiedades genera muchos casos de prueba para garantías más fuertes
  - Ejecutar tests en código SIN CORREGIR
  - **RESULTADO ESPERADO**: Tests PASAN (esto confirma el comportamiento base a preservar)
  - Marcar tarea completa cuando los tests estén escritos, ejecutados, y pasando en código sin corregir
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Corrección de errores de compilación TypeScript

  - [x] 3.1 Corregir arrangement.ts - destructurar { data, error } de consultas Supabase
    - En `src/actions/arrangement.ts` líneas 54-65, cambiar acceso directo a propiedades por destructuración
    - Patrón: `const { data, error } = await supabase.from(...).select(...)`
    - Agregar manejo de errores: `if (error) throw error`
    - Usar `data` en lugar del resultado directo de la consulta
    - _Bug_Condition: isBugCondition(input) donde input contiene acceso a propiedades sin verificar error de Supabase_
    - _Expected_Behavior: Compilación exitosa con tipos correctos después de destructuración_
    - _Preservation: Las consultas deben retornar los mismos datos con la misma estructura_
    - _Requirements: 1.1, 2.1, 3.1_

  - [x] 3.2 Corregir order.ts - usar variable orderIdNum y coercer tipos
    - En `src/actions/order.ts` líneas 66-76, usar la variable `orderIdNum` declarada
    - Agregar coerción explícita de string|number a number: `const orderIdNum = Number(orderId)`
    - Agregar validación: `if (isNaN(orderIdNum)) throw new Error('Invalid order ID')`
    - _Bug_Condition: isBugCondition(input) donde input tiene discrepancia de tipos en IDs_
    - _Expected_Behavior: Tipos consistentes con conversión explícita y validación_
    - _Preservation: El procesamiento de órdenes debe funcionar igual con IDs válidos_
    - _Requirements: 1.2, 2.2, 3.2_

  - [x] 3.3 Agregar propiedades faltantes a interfaz Order
    - En `src/interfaces/order.interface.ts`, agregar propiedades a la interfaz Order:
      - `items`: array de items de la orden
      - `buyer_data`: datos del comprador
      - `order_number`: número de orden
      - `payment_method`: método de pago
      - `paid_at`: fecha de pago
    - Revisar uso en `src/actions/order.ts` y `src/pages/ThankyouPage.tsx` para determinar tipos exactos
    - _Bug_Condition: isBugCondition(input) donde input accede a propiedades no definidas en Order_
    - _Expected_Behavior: Todas las propiedades accesibles definidas en la interfaz_
    - _Preservation: Propiedades existentes de Order deben funcionar sin cambios_
    - _Requirements: 1.3, 2.3, 3.4_

  - [x] 3.4 Eliminar imports no utilizados
    - Buscar y eliminar imports no utilizados en todos los archivos:
      - `useCartStore` (si no se usa)
      - `watch` (si no se usa)
      - `getComputedColumns` (si no se usa)
      - `userEvent` (si no se usa)
      - `orderIdNum` (si no se usa después de 3.2)
      - `errors` (si no se usa)
    - Usar búsqueda de código para localizar archivos con estos imports
    - _Bug_Condition: isBugCondition(input) donde input tiene imports no utilizados_
    - _Expected_Behavior: Sin errores TS6133 después de eliminar imports_
    - _Preservation: El código debe funcionar igual sin los imports no utilizados_
    - _Requirements: 1.4, 2.4, 3.5_

  - [x] 3.5 Corregir tests - eliminar propiedad 'active'
    - En `src/components/arrangement-builder/ConfigurationActions.test.tsx` línea 47, eliminar `active: true` del helper `createComponent`
    - En `src/store/arrangement.store.test.ts`, revisar y eliminar propiedades inexistentes
    - _Bug_Condition: isBugCondition(input) donde input usa propiedades no definidas en tests_
    - _Expected_Behavior: Tests compilan sin errores de propiedades inexistentes_
    - _Preservation: Tests deben pasar con el mismo comportamiento_
    - _Requirements: 1.5, 2.5, 3.3_

  - [x] 3.6 Corregir discrepancias Element/HTMLElement en tests
    - En `src/components/dashboard/products/UploaderImages.touch-accessibility.test.tsx`, cambiar `Element` a `HTMLElement`
    - Agregar `as HTMLElement` en asignaciones de tipo donde sea necesario
    - O usar métodos que retornen `HTMLElement` directamente
    - _Bug_Condition: isBugCondition(input) donde input tiene discrepancia Element/HTMLElement_
    - _Expected_Behavior: Tipos compatibles sin errores de asignación_
    - _Preservation: Tests de accesibilidad deben pasar con el mismo comportamiento_
    - _Requirements: 1.6, 2.6, 3.3_

  - [x] 3.7 Verificar que el test de exploración de bug ahora pasa
    - **Property 1: Expected Behavior** - Compilación TypeScript Exitosa
    - **IMPORTANTE**: Re-ejecutar el MISMO test del paso 1 - NO escribir un test nuevo
    - El test del paso 1 codifica el comportamiento esperado
    - Cuando este test pase, confirma que el comportamiento esperado se satisface
    - Ejecutar `tsc -b` en el código corregido
    - **RESULTADO ESPERADO**: Test PASA (confirma que el bug está corregido)
    - Verificar que no hay errores de compilación
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 3.8 Verificar que los tests de preservación aún pasan
    - **Property 2: Preservation** - Comportamiento en Tiempo de Ejecución Sin Cambios
    - **IMPORTANTE**: Re-ejecutar los MISMOS tests del paso 2 - NO escribir tests nuevos
    - Ejecutar tests de preservación del paso 2
    - **RESULTADO ESPERADO**: Tests PASAN (confirma que no hay regresiones)
    - Confirmar que todos los tests aún pasan después de la corrección (sin regresiones)
    - Verificar que la funcionalidad de la aplicación permanece sin cambios
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint - Asegurar que todos los tests pasan
  - Ejecutar `tsc -b && vite build` para verificar compilación completa
  - Verificar que el despliegue en Netlify puede completarse exitosamente
  - Preguntar al usuario si surgen dudas
