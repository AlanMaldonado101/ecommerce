# Plan de Implementación: Integración de Checkout con Mercado Pago

## Descripción General

Este plan implementa un sistema completo de checkout con Mercado Pago usando Checkout Pro (redirección). La implementación incluye Edge Functions de Supabase para comunicación segura con Mercado Pago, esquema de base de datos para órdenes y transacciones, componentes React para el flujo de checkout, procesamiento de webhooks, y gestión automática de inventario post-pago.

## Tareas

- [x] 1. Configurar variables de entorno y secretos
  - Agregar VITE_MERCADOPAGO_PUBLIC_KEY al archivo .env del frontend
  - Configurar secretos en Supabase: MERCADOPAGO_ACCESS_TOKEN y FRONTEND_URL
  - Documentar las credenciales de prueba en README
  - _Requisitos: 1.1, 1.2, 1.3, 1.5_

- [ ] 2. Crear esquema de base de datos
  - [x] 2.1 Crear migración para tabla orders
    - Crear archivo de migración con tabla orders (id, order_number, buyer_id, preference_id, payment_id, buyer_data, items, total_amount, currency, status, payment_method, created_at, paid_at, stock_updated)
    - Agregar constraints y checks para status válido
    - Crear índices para buyer_id, status, preference_id, payment_id, created_at
    - _Requisitos: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_
  
  - [x] 2.2 Crear migración para tabla payment_transactions
    - Crear archivo de migración con tabla payment_transactions (id, order_id, payment_id, status, status_detail, amount, payment_method_id, payment_type_id, response_data, created_at)
    - Agregar constraint para status válido
    - Crear índices para order_id, payment_id, status
    - _Requisitos: 7.9, 15.2_
  
  - [x] 2.3 Crear políticas RLS para orders
    - Política SELECT: usuarios pueden ver solo sus propias órdenes
    - Política INSERT: usuarios pueden crear órdenes solo para sí mismos
    - Política UPDATE: solo admins pueden actualizar órdenes
    - _Requisitos: 9.4, 12.4_
  
  - [x] 2.4 Crear políticas RLS para payment_transactions
    - Política SELECT: usuarios pueden ver transacciones de sus propias órdenes
    - _Requisitos: 12.4_

- [ ] 3. Implementar módulo compartido MercadoPagoClient
  - [x] 3.1 Crear clase MercadoPagoClient con métodos base
    - Implementar constructor que recibe accessToken
    - Configurar cliente HTTP con timeout de 30 segundos
    - Implementar lógica de reintentos con backoff exponencial (máximo 2 reintentos)
    - _Requisitos: 3.1, 3.6_
  
  - [x] 3.2 Implementar método createPreference
    - Crear método que recibe objeto de preferencia
    - Hacer POST a /checkout/preferences de Mercado Pago
    - Retornar preference_id e init_point
    - Manejar errores con mensajes descriptivos
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 3.3 Implementar método getPayment
    - Crear método que recibe payment_id
    - Hacer GET a /v1/payments/{id} de Mercado Pago
    - Retornar detalles completos del pago
    - _Requisitos: 7.3_
  
  - [x] 3.4 Implementar método validateWebhookSignature
    - Crear método que recibe signature, requestId, dataId
    - Validar firma HMAC-SHA256 usando access token
    - Retornar boolean indicando si es válida
    - _Requisitos: 7.2, 12.7_
  
  - [ ]* 3.5 Escribir unit tests para MercadoPagoClient
    - Test: createPreference con datos válidos retorna preference_id
    - Test: getPayment con payment_id válido retorna detalles
    - Test: validateWebhookSignature con firma válida retorna true
    - Test: validateWebhookSignature con firma inválida retorna false
    - Test: timeout después de 30 segundos
    - Test: reintentos con backoff exponencial

- [ ] 4. Implementar módulo de utilidades compartidas
  - [x] 4.1 Crear función generateOrderNumber
    - Generar número en formato ORD-YYYYMMDD-XXXXX
    - XXXXX es un número secuencial de 5 dígitos
    - _Requisitos: 4.3_
  
  - [x] 4.2 Crear función validateOrderAmount
    - Recibir array de items y totalAmount
    - Calcular suma de (quantity × unit_price) de todos los items
    - Retornar true si coincide con totalAmount
    - _Requisitos: 12.1_
  
  - [x] 4.3 Crear función translateMercadoPagoError
    - Traducir errores comunes de Mercado Pago a español
    - Mapear códigos de error a mensajes amigables
    - _Requisitos: 11.1, 11.2, 11.3_
  
  - [ ]* 4.4 Escribir unit tests para utilidades
    - Test: generateOrderNumber genera formato correcto
    - Test: validateOrderAmount valida correctamente
    - Test: translateMercadoPagoError traduce errores comunes

- [x] 5. Checkpoint - Verificar módulos compartidos
  - Asegurar que todos los tests pasen, preguntar al usuario si surgen dudas.

- [ ] 6. Implementar Edge Function create-preference
  - [x] 6.1 Crear estructura base de la función
    - Crear archivo supabase/functions/create-preference/index.ts
    - Configurar CORS headers
    - Implementar autenticación con Supabase Auth
    - Definir interfaces TypeScript para request y response
    - _Requisitos: 12.3_
  
  - [x] 6.2 Implementar validación de datos de entrada
    - Validar que totalAmount coincide con suma de items
    - Validar que todos los precios coinciden con la base de datos
    - Validar que el usuario está autenticado
    - Retornar errores descriptivos si falla validación
    - _Requisitos: 12.1, 12.2, 12.3_
  
  - [x] 6.3 Implementar validación de stock
    - Consultar stock disponible para cada variante
    - Verificar que hay stock suficiente para cada item
    - Retornar error con detalles si stock insuficiente
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 6.4 Implementar creación de orden pendiente
    - Generar número de orden con generateOrderNumber
    - Crear registro en tabla orders con status "pending"
    - Almacenar items y buyer_data como JSONB
    - Calcular y almacenar total_amount
    - _Requisitos: 4.1, 4.2, 4.3, 4.5, 4.6, 4.7, 4.8, 4.9_
  
  - [x] 6.5 Implementar creación de preferencia en Mercado Pago
    - Construir objeto de preferencia con items, buyer data y URLs de retorno
    - Llamar a MercadoPagoClient.createPreference
    - Actualizar orden con preference_id
    - Retornar orderId, preferenceId e initPoint
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 4.4, 13.1, 13.2, 13.3, 13.4_
  
  - [x] 6.6 Implementar manejo de errores y logging
    - Try-catch global con logging detallado
    - Retornar respuestas JSON consistentes
    - Usar códigos HTTP apropiados (400, 401, 500)
    - Registrar cada intento con timestamp y datos del comprador
    - _Requisitos: 1.4, 3.6, 15.1, 15.5, 15.6_
  
  - [ ]* 6.7 Escribir unit tests para create-preference
    - Test: creación exitosa con datos válidos
    - Test: rechazo por stock insuficiente
    - Test: rechazo por monto inválido
    - Test: rechazo por precio manipulado
    - Test: rechazo por usuario no autenticado
  
  - [ ]* 6.8 Escribir property test para validación de stock
    - **Property 1: Validación de Stock Antes de Checkout**
    - **Valida: Requisitos 2.1, 2.2**
  
  - [ ]* 6.9 Escribir property test para estructura de preferencia
    - **Property 2: Creación Completa de Preferencia**
    - **Valida: Requisitos 3.1, 3.2, 3.3, 3.4, 3.5**
  
  - [ ]* 6.10 Escribir property test para estructura de orden
    - **Property 3: Estructura Válida de Orden Creada**
    - **Valida: Requisitos 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9**
  
  - [ ]* 6.11 Escribir property test para validación de monto
    - **Property 13: Validación de Monto Total**
    - **Valida: Requisitos 12.1**
  
  - [ ]* 6.12 Escribir property test para validación de precios
    - **Property 14: Validación de Precios contra Base de Datos**
    - **Valida: Requisitos 12.2**

- [ ] 7. Implementar Edge Function mercadopago-webhook
  - [x] 7.1 Crear estructura base de la función
    - Crear archivo supabase/functions/mercadopago-webhook/index.ts
    - Configurar CORS headers
    - Definir interfaces TypeScript para webhook payload
    - _Requisitos: 7.1_
  
  - [x] 7.2 Implementar validación de firma de webhook
    - Extraer headers x-signature y x-request-id
    - Llamar a MercadoPagoClient.validateWebhookSignature
    - Retornar HTTP 400 si firma es inválida
    - _Requisitos: 7.2, 7.10, 12.7_
  
  - [x] 7.3 Implementar consulta de detalles de pago
    - Extraer payment_id del payload
    - Llamar a MercadoPagoClient.getPayment
    - Obtener status, status_detail, payment_method, external_reference
    - _Requisitos: 7.3_
  
  - [x] 7.4 Implementar actualización de estado de orden
    - Buscar orden por external_reference (order_id)
    - Actualizar status según payment status: approved → paid, rejected → cancelled, pending → pending
    - Registrar paid_at, payment_method y payment_id cuando status es approved
    - _Requisitos: 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_
  
  - [x] 7.5 Implementar actualización de inventario
    - Verificar que status es "approved" y stock_updated es false
    - Reducir stock de cada variante en la cantidad del item
    - Usar transacción SQL para operación atómica
    - Marcar orden como stock_updated = true
    - Registrar alerta en logs si stock resulta negativo
    - _Requisitos: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 7.6 Implementar registro de transacción
    - Crear registro en payment_transactions con datos completos del pago
    - Almacenar response_data como JSONB para auditoría
    - _Requisitos: 7.9, 15.2_
  
  - [x] 7.7 Implementar logging completo
    - Registrar cada webhook recibido con contenido completo
    - Registrar cada cambio de status con timestamp y motivo
    - Registrar cada actualización de stock con order_id y cantidad
    - Incluir order_id en todos los logs
    - Usar niveles de log apropiados (info, warning, error)
    - _Requisitos: 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_
  
  - [ ]* 7.8 Escribir unit tests para mercadopago-webhook
    - Test: procesamiento exitoso con firma válida
    - Test: rechazo con firma inválida
    - Test: actualización a "paid" cuando payment status es "approved"
    - Test: actualización a "cancelled" cuando payment status es "rejected"
    - Test: reducción de stock después de pago aprobado
    - Test: idempotencia de actualización de stock (múltiples webhooks)
  
  - [ ]* 7.9 Escribir property test para validación de firma
    - **Property 5: Validación de Firma de Webhook**
    - **Valida: Requisitos 7.2, 7.10**
  
  - [ ]* 7.10 Escribir property test para actualización de estado
    - **Property 6: Actualización de Estado de Orden por Payment Status**
    - **Valida: Requisitos 7.4**
  
  - [ ]* 7.11 Escribir property test para datos de pago aprobado
    - **Property 7: Datos Completos de Pago Aprobado**
    - **Valida: Requisitos 7.7, 7.8, 7.9**
  
  - [ ]* 7.12 Escribir property test para reducción de inventario
    - **Property 8: Reducción Exacta de Inventario**
    - **Valida: Requisitos 8.1, 8.2, 8.5**

- [x] 8. Checkpoint - Verificar Edge Functions
  - Asegurar que todos los tests pasen, preguntar al usuario si surgen dudas.

- [ ] 9. Implementar hook useCheckout
  - [x] 9.1 Crear estructura base del hook
    - Crear archivo src/hooks/useCheckout.ts
    - Definir interfaces TypeScript para CheckoutData y retorno del hook
    - Implementar estados para loading y error
    - _Requisitos: 3.1_
  
  - [x] 9.2 Implementar función createCheckout
    - Llamar a Edge Function create-preference con datos del checkout
    - Manejar respuesta exitosa extrayendo initPoint
    - Redirigir a Mercado Pago usando window.location.href
    - Manejar errores mostrando mensajes descriptivos
    - _Requisitos: 5.1, 5.4_
  
  - [ ]* 9.3 Escribir unit tests para useCheckout
    - Test: llamada exitosa a create-preference
    - Test: redirección a Mercado Pago con initPoint
    - Test: manejo de error cuando stock es insuficiente
    - Test: manejo de error cuando monto es inválido

- [ ] 10. Implementar componente CheckoutPage
  - [x] 10.1 Crear estructura base del componente
    - Crear archivo src/pages/CheckoutPage.tsx
    - Implementar layout con resumen de carrito y formulario
    - Usar react-hook-form para manejo de formulario
    - _Requisitos: 3.1_
  
  - [x] 10.2 Implementar formulario de datos del comprador
    - Campos: nombre, email, teléfono, calle, número, código postal, ciudad, región
    - Validaciones: campos requeridos, formato de email, formato de teléfono
    - Mostrar errores de validación en tiempo real
    - _Requisitos: 3.3_
  
  - [x] 10.3 Implementar resumen de carrito
    - Mostrar lista de items con imagen, nombre, cantidad y precio
    - Calcular y mostrar subtotal y total
    - _Requisitos: 3.2_
  
  - [x] 10.4 Implementar botón de confirmar compra
    - Llamar a useCheckout.createCheckout al hacer submit
    - Mostrar indicador de carga durante creación de preferencia
    - Deshabilitar botón mientras está procesando
    - _Requisitos: 5.3_
  
  - [x] 10.5 Implementar manejo de errores
    - Mostrar toast con mensaje de error cuando falla
    - Mantener datos del formulario en caso de error
    - Mostrar detalles de productos sin stock si aplica
    - _Requisitos: 2.2, 2.5, 11.1, 11.2, 11.3_
  
  - [ ]* 10.6 Escribir unit tests para CheckoutPage
    - Test: renderizado con carrito
    - Test: validación de formulario
    - Test: llamada a createCheckout al confirmar
    - Test: mostrar error cuando stock es insuficiente

- [ ] 11. Implementar componente PaymentResultPage
  - [x] 11.1 Crear estructura base del componente
    - Crear archivo src/pages/PaymentResultPage.tsx
    - Implementar rutas para /checkout/success, /checkout/failure, /checkout/pending
    - Extraer parámetros de URL (order_id, status, reason)
    - _Requisitos: 6.1, 6.2, 13.5_
  
  - [x] 11.2 Implementar consulta de orden
    - Llamar a Supabase para obtener detalles de la orden
    - Mostrar loading mientras se consulta
    - Manejar error si orden no existe o no pertenece al usuario
    - _Requisitos: 10.1, 10.6_
  
  - [x] 11.3 Implementar vista de pago exitoso
    - Mostrar mensaje de confirmación
    - Mostrar número de orden
    - Botón para ver detalle de orden
    - _Requisitos: 6.3, 6.6_
  
  - [x] 11.4 Implementar vista de pago fallido
    - Mostrar mensaje de error con motivo del rechazo
    - Mostrar número de orden
    - Botón para reintentar pago
    - _Requisitos: 6.4, 6.6, 11.5_
  
  - [x] 11.5 Implementar vista de pago pendiente
    - Mostrar mensaje informativo
    - Mostrar número de orden
    - Botón para ver detalle de orden
    - _Requisitos: 6.5, 6.6_
  
  - [ ]* 11.6 Escribir unit tests para PaymentResultPage
    - Test: renderizado con orden exitosa
    - Test: renderizado con orden fallida
    - Test: renderizado con orden pendiente
    - Test: extracción de parámetros de URL
  
  - [ ]* 11.7 Escribir property test para extracción de parámetros
    - **Property 4: Extracción de Parámetros de URL de Retorno**
    - **Valida: Requisitos 6.2**

- [ ] 12. Implementar componente OrderDetailPage
  - [x] 12.1 Crear estructura base del componente
    - Crear archivo src/pages/OrderDetailPage.tsx
    - Extraer order_id de parámetros de ruta
    - Implementar layout para mostrar detalles completos
    - _Requisitos: 10.1_
  
  - [x] 12.2 Implementar consulta de orden
    - Llamar a Supabase para obtener orden por ID
    - Verificar autorización (RLS automático)
    - Mostrar loading mientras se consulta
    - Manejar error si orden no existe o no pertenece al usuario
    - _Requisitos: 10.6, 10.7_
  
  - [x] 12.3 Implementar vista de datos del comprador
    - Mostrar nombre, email, teléfono
    - Mostrar dirección completa de envío
    - _Requisitos: 10.2_
  
  - [x] 12.4 Implementar vista de items de la orden
    - Mostrar lista de items con imagen, nombre, cantidad, precio unitario y subtotal
    - Calcular y mostrar total
    - _Requisitos: 10.3_
  
  - [x] 12.5 Implementar vista de estado y pago
    - Mostrar estado actual de la orden
    - Mostrar fecha de creación
    - Si está pagada, mostrar método de pago y fecha de pago
    - _Requisitos: 10.4, 10.5_
  
  - [ ]* 12.6 Escribir unit tests para OrderDetailPage
    - Test: consulta de orden por ID
    - Test: renderizado de datos completos
    - Test: autorización de acceso (solo dueño)
  
  - [ ]* 12.7 Escribir property test para consulta de órdenes
    - **Property 9: Consulta de Órdenes por Buyer**
    - **Valida: Requisitos 9.1, 9.2, 9.3, 9.4**
  
  - [ ]* 12.8 Escribir property test para completitud de detalle
    - **Property 10: Completitud de Detalle de Orden**
    - **Valida: Requisitos 10.1, 10.2, 10.3, 10.4, 10.5**
  
  - [ ]* 12.9 Escribir property test para autorización
    - **Property 11: Autorización de Acceso a Órdenes**
    - **Valida: Requisitos 10.6, 12.4**

- [ ] 13. Implementar componente OrdersListPage
  - [x] 13.1 Crear estructura base del componente
    - Crear archivo src/pages/OrdersListPage.tsx
    - Implementar layout con lista de órdenes
    - _Requisitos: 9.1_
  
  - [x] 13.2 Implementar consulta de órdenes del usuario
    - Llamar a Supabase para obtener órdenes del usuario autenticado
    - Ordenar por fecha de creación descendente
    - Filtrar automáticamente por buyer_id usando RLS
    - Manejar error si usuario no está autenticado
    - _Requisitos: 9.1, 9.2, 9.4, 9.5_
  
  - [x] 13.3 Implementar vista de lista de órdenes
    - Mostrar tarjeta por cada orden con: número de orden, monto total, estado, fecha de creación
    - Link a detalle de orden
    - Indicador visual de estado (badge con color)
    - _Requisitos: 9.3_
  
  - [ ]* 13.4 Escribir unit tests para OrdersListPage
    - Test: consulta de órdenes del usuario
    - Test: renderizado de lista
    - Test: ordenamiento por fecha descendente
    - Test: error cuando usuario no autenticado

- [x] 14. Checkpoint - Verificar componentes frontend
  - Asegurar que todos los tests pasen, preguntar al usuario si surgen dudas.

- [ ] 15. Integración y configuración final
  - [x] 15.1 Configurar rutas en el router
    - Agregar ruta /checkout para CheckoutPage
    - Agregar rutas /checkout/success, /checkout/failure, /checkout/pending para PaymentResultPage
    - Agregar ruta /orders para OrdersListPage
    - Agregar ruta /orders/:id para OrderDetailPage
    - _Requisitos: 13.5_
  
  - [x] 15.2 Configurar variables de entorno en producción
    - Documentar proceso de configuración de secretos en Supabase
    - Documentar proceso de cambio de credenciales de prueba a producción
    - _Requisitos: 1.1, 1.2, 1.3, 14.1_
  
  - [x] 15.3 Agregar indicador de modo de prueba
    - Mostrar banner en UI cuando se usan credenciales de prueba
    - Verificar que access token comienza con "TEST-"
    - _Requisitos: 14.4_
  
  - [ ]* 15.4 Escribir property test para orden permanece pending
    - **Property 12: Orden Permanece Pending en Pago Fallido**
    - **Valida: Requisitos 11.4**
  
  - [ ]* 15.5 Escribir tests de integración end-to-end
    - Test: flujo completo de checkout exitoso
    - Test: flujo completo de checkout con pago rechazado
    - Test: flujo completo de checkout con stock insuficiente
    - Test: procesamiento de webhook y actualización de orden
    - Test: actualización de inventario post-pago

- [x] 16. Checkpoint final - Verificar integración completa
  - Asegurar que todos los tests pasen, preguntar al usuario si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los property tests validan propiedades universales de corrección
- Los unit tests validan casos específicos y edge cases
- La implementación usa TypeScript para type safety
- Las Edge Functions manejan toda la lógica sensible de seguridad
- RLS garantiza que los usuarios solo accedan a sus propias órdenes
