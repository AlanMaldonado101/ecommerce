# Documento de Requisitos de Corrección de Errores

## Introducción

El proceso de compilación de TypeScript está fallando durante el despliegue en Netlify, bloqueando la publicación de la aplicación. Los errores ocurren en el paso `tsc -b && vite build` e incluyen problemas de tipado en consultas de Supabase, discrepancias de tipos en propiedades de objetos, y variables no utilizadas. La causa raíz principal es que los resultados de las consultas de Supabase no están siendo verificados correctamente para errores antes de acceder a sus propiedades, lo que hace que TypeScript detecte posibles tipos de error en lugar de objetos de datos.

## Análisis del Error

### Comportamiento Actual (Defecto)

1.1 CUANDO se accede a propiedades de resultados de consultas Supabase sin verificar errores primero (src/actions/arrangement.ts líneas 54-65) ENTONCES el sistema genera errores "Property 'X' does not exist on type 'SelectQueryError<...>'"

1.2 CUANDO se asignan IDs de orden como string | number sin conversión explícita (src/actions/order.ts líneas 66-76) ENTONCES el sistema genera errores de discrepancia de tipos

1.3 CUANDO se accede a propiedades faltantes en el tipo Order (items, buyer_data, order_number, payment_method, paid_at) ENTONCES el sistema genera errores de propiedad inexistente (src/actions/order.ts líneas 72-76, src/pages/ThankyouPage.tsx líneas 89-92)

1.4 CUANDO existen variables importadas pero no utilizadas (useCartStore, watch, getComputedColumns, userEvent, orderIdNum, errors) ENTONCES el sistema genera errores TS6133

1.5 CUANDO se usan propiedades desconocidas en literales de objetos en tests (active, propiedades no definidas) ENTONCES el sistema genera errores de tipo en archivos de prueba (src/components/arrangement-builder/ConfigurationActions.test.tsx, src/store/arrangement.store.test.ts)

1.6 CUANDO hay discrepancias entre tipos Element y HTMLElement en tests ENTONCES el sistema genera errores de tipo (src/components/dashboard/products/UploaderImages.touch-accessibility.test.tsx)

### Comportamiento Esperado (Correcto)

2.1 CUANDO se accede a propiedades de resultados de consultas Supabase ENTONCES el sistema DEBERÁ verificar primero si hay errores y manejar correctamente los tipos de datos y error

2.2 CUANDO se asignan IDs de orden ENTONCES el sistema DEBERÁ usar tipos consistentes (number) o realizar conversiones explícitas con validación

2.3 CUANDO se accede a propiedades del tipo Order ENTONCES el sistema DEBERÁ tener todas las propiedades necesarias definidas en la interfaz (items, buyer_data, order_number, payment_method, paid_at)

2.4 CUANDO se importan variables ENTONCES el sistema DEBERÁ usar todas las variables importadas o eliminar las importaciones no utilizadas

2.5 CUANDO se definen objetos en tests ENTONCES el sistema DEBERÁ usar solo propiedades que existen en los tipos correspondientes

2.6 CUANDO se trabaja con elementos DOM en tests ENTONCES el sistema DEBERÁ usar los tipos correctos (HTMLElement) con las aserciones de tipo apropiadas

### Comportamiento Sin Cambios (Prevención de Regresiones)

3.1 CUANDO las consultas de Supabase se ejecutan correctamente sin errores ENTONCES el sistema DEBERÁ CONTINUAR retornando los datos esperados con la misma estructura

3.2 CUANDO se procesan órdenes con IDs válidos ENTONCES el sistema DEBERÁ CONTINUAR funcionando correctamente con la lógica de negocio existente

3.3 CUANDO se ejecutan tests que actualmente pasan ENTONCES el sistema DEBERÁ CONTINUAR pasando esos tests sin cambios en su comportamiento

3.4 CUANDO se accede a propiedades existentes del tipo Order que ya están definidas ENTONCES el sistema DEBERÁ CONTINUAR funcionando sin cambios

3.5 CUANDO el código TypeScript compila correctamente en archivos no afectados ENTONCES el sistema DEBERÁ CONTINUAR compilando sin errores adicionales
