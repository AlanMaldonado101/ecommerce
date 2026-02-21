# Plan de Implementación: Integración de Pagos con Mercado Pago

## Overview

Este plan implementa un sistema completo de procesamiento de pagos con Mercado Pago para un e-commerce en Chile, soportando dos métodos de integración: Checkout Pro (redirección) y Checkout API (formulario embebido). La arquitectura utiliza React/TypeScript en el frontend, Supabase Edge Functions en el backend, y PostgreSQL como base de datos.

El plan sigue un enfoque incremental: primero se establece la infraestructura de base de datos y backend, luego se implementan los dos flujos de pago, y finalmente se integra todo con el frontend y se añaden las páginas de confirmación.

## Tasks

- [ ] 1. Configurar infraestructura de base de datos y seguridad
  - [x] 1.1 Crear esquema de base de datos con tablas orders, payment_transactions y order_status_history
    - Crear tabla orders con columnas: id, order_number, buyer_id, items, total_amount, currency, status, payment_method, preference_id, buyer_data, created_at, updated_at, paid_at
    - Crear tabla payment_transactions con columnas: id, order_id, payment_id, status, amount, payment_method_id, payment_type_id, status_detail, response_data, created_at, updated_at
    - Crear tabla order_status_history con columnas: id, order_id, previous_status, new_status, changed_by, metadata, created_at
    - Definir constraints: unique en order_number, foreign keys, checks de validación
    - Crear índices para optimizar consultas
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_
  
  - [ ]* 1.2 Escribir property test para esquema de base de datos
    - **Property 12: Order Structure Completeness**
    - **Valida: Requirements 4.2**
  
  - [x] 1.3 Implementar políticas de Row Level Security (RLS)
    - Habilitar RLS en las tres tablas
    - Crear política para que usuarios vean solo sus propias órdenes
    - Crear política para que usuarios creen órdenes solo con su buyer_id
    - Crear política para que usuarios vean transacciones solo de sus órdenes
    - Crear política para service_role con acceso completo
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_
  
  - [ ]* 1.4 Escribir property test para políticas RLS
    - **Property 32: RLS Policy Enforcement**
    - **Valida: Requirements 15.3, 15.4, 15.5, 15.7_

- [ ] 2. Implementar utilidades y cliente de Mercado Pago
  - [x] 2.1 Crear clase MercadoPagoClient con métodos para API
    - Implementar constructor con accessToken
    - Implementar método createPreference()
    - Implementar método createPayment()
    - Implementar método getPayment()
    - Implementar método validateWebhookSignature()
    - Configurar timeout de 30 segundos y retry con backoff exponencial
    - _Requirements: 18.1, 18.2, 18.3_
  
  - [~] 2.2 Implementar funciones de utilidad
    - Implementar validateOrderAmount() para validar y recalcular totales
    - Implementar generateOrderNumber() con formato ORD-YYYYMMDD-XXXXX
    - Implementar translateMercadoPagoError() con traducciones a español
    - Implementar validateBuyerData() para validar email y teléfono
    - Implementar formatCurrency() para formato chileno
    - _Requirements: 6.3, 12.2, 13.1, 13.2, 13.5_
  
  - [ ]* 2.3 Escribir property tests para utilidades
    - **Property 29: Token Expiration Handling**
    - **Property 30: Amount Validation and Recalculation**
    - **Property 31: Item Existence Validation**
    - **Valida: Requirements 12.7, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6**
  
  - [ ]* 2.4 Escribir unit tests para funciones de utilidad
    - Test para validateOrderAmount con casos edge
    - Test para generateOrderNumber verificando unicidad
    - Test para translateMercadoPagoError con códigos conocidos y desconocidos
    - Test para validateBuyerData con formatos válidos e inválidos
    - _Requirements: 6.3, 12.2, 13.1_

- [~] 3. Checkpoint - Verificar infraestructura base
  - Asegurar que todas las pruebas pasen, preguntar al usuario si surgen dudas.

- [ ] 4. Implementar Edge Function para Checkout Pro
  - [~] 4.1 Crear función create-preference en Supabase Edge Functions
    - Configurar endpoint POST /functions/v1/create-preference
    - Validar y parsear request body con items y payer data
    - Recalcular total basado en precios de base de datos
    - Validar que items existan y cantidades sean positivas
    - Crear orden en estado "pending" con order_number único
    - Crear preferencia en Mercado Pago con back_urls y notification_url
    - Almacenar preference_id en la orden
    - Retornar preferenceId, initPoint, orderId y orderNumber
    - Implementar manejo de errores con logging
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 4.1, 4.3, 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ]* 4.2 Escribir property tests para create-preference
    - **Property 1: Order Creation with Pending Status**
    - **Property 2: Payment Preference Contains Cart Items**
    - **Property 3: Payment Preference Structure Completeness**
    - **Property 4: Preference ID Persistence**
    - **Valida: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 4.1, 4.3**
  
  - [ ]* 4.3 Escribir unit tests para create-preference
    - Test para creación exitosa de preferencia
    - Test para validación de montos
    - Test para items inexistentes
    - Test para manejo de errores de Mercado Pago
    - _Requirements: 1.1, 1.6, 13.2, 13.4_

- [ ] 5. Implementar Edge Function para Checkout API
  - [~] 5.1 Crear función process-payment en Supabase Edge Functions
    - Configurar endpoint POST /functions/v1/process-payment
    - Validar y parsear request body con token, items y payer data
    - Recalcular total basado en precios de base de datos
    - Crear orden en estado "pending"
    - Procesar pago en Mercado Pago usando card token
    - Crear payment_transaction con respuesta completa
    - Actualizar estado de orden según resultado (approved → paid, rejected → failed)
    - Retornar paymentId, status, statusDetail, orderId y orderNumber
    - Implementar manejo de errores con traducción a español
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 4.1, 5.1, 5.2, 5.3, 5.6, 12.1, 12.2_
  
  - [ ]* 5.2 Escribir property tests para process-payment
    - **Property 6: Card Token Generation and Transmission**
    - **Property 7: Payment Processing Response Structure**
    - **Property 16: Payment Transaction Creation**
    - **Property 17: Transaction-Order Relationship**
    - **Valida: Requirements 2.3, 2.4, 2.6, 2.8, 5.1, 5.2, 5.3, 5.6**
  
  - [ ]* 5.3 Escribir unit tests para process-payment
    - Test para pago aprobado
    - Test para pago rechazado
    - Test para token inválido
    - Test para validación de montos
    - Test para nunca almacenar datos de tarjeta
    - _Requirements: 2.6, 2.7, 2.8, 12.1_

- [ ] 6. Implementar Edge Function para Webhook
  - [~] 6.1 Crear función webhook-handler en Supabase Edge Functions
    - Configurar endpoint POST /functions/v1/webhook-handler como público
    - Validar firma x-signature del header
    - Retornar HTTP 401 si firma es inválida
    - Parsear notificación y extraer payment_id
    - Consultar estado actual del pago en API de Mercado Pago
    - Buscar orden por external_reference (order_number)
    - Actualizar o crear payment_transaction con datos actualizados
    - Actualizar estado de orden: approved → paid, rejected → failed
    - Registrar paid_at cuando orden cambia a paid
    - Crear registro en order_status_history
    - Implementar idempotencia para notificaciones duplicadas
    - Retornar HTTP 200 después de procesar
    - Usar service_role key para operaciones de base de datos
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.6, 4.7, 5.4, 15.6_
  
  - [ ]* 6.2 Escribir property tests para webhook-handler
    - **Property 8: Webhook Signature Validation**
    - **Property 9: Webhook Idempotency**
    - **Property 10: Payment Status to Order Status Mapping**
    - **Property 11: Webhook Payment Query**
    - **Property 15: State Change History**
    - **Property 18: Transaction Updates from Webhook**
    - **Valida: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.7, 5.4**
  
  - [ ]* 6.3 Escribir unit tests para webhook-handler
    - Test para firma válida
    - Test para firma inválida
    - Test para notificación de pago aprobado
    - Test para notificación de pago rechazado
    - Test para notificaciones duplicadas (idempotencia)
    - _Requirements: 3.2, 3.7, 3.9_

- [ ] 7. Checkpoint - Verificar backend completo
  - Asegurar que todas las pruebas pasen, preguntar al usuario si surgen dudas.

- [ ] 8. Implementar componente CheckoutPage
  - [ ] 8.1 Crear componente CheckoutPage con formulario de datos del comprador
    - Crear interfaz CheckoutPageProps y CheckoutState
    - Leer items del Cart Store y validar que no esté vacío
    - Mostrar resumen de items con precios y total
    - Crear formulario para datos del comprador (nombre, email, teléfono, dirección)
    - Implementar validación de formato de email y teléfono
    - Mostrar opciones de método de pago (Checkout Pro y Checkout API)
    - Mostrar interfaz correspondiente según método seleccionado
    - Deshabilitar botón de pago durante procesamiento
    - Mostrar indicadores de carga
    - Implementar manejo de errores con mensajes en español
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 16.1, 16.2_
  
  - [ ]* 8.2 Escribir property tests para CheckoutPage
    - **Property 19: Buyer Data Validation**
    - **Property 33: Cart Store Integration**
    - **Valida: Requirements 6.3, 16.1, 16.2, 16.6**
  
  - [ ]* 8.3 Escribir unit tests para CheckoutPage
    - Test para renderizado con items del carrito
    - Test para error cuando carrito está vacío
    - Test para validación de email
    - Test para validación de teléfono
    - Test para deshabilitar botón durante procesamiento
    - _Requirements: 6.1, 6.3, 6.6, 16.2_

- [ ] 9. Implementar componente CardForm para Checkout API
  - [ ] 9.1 Crear componente CardForm usando SDK de Mercado Pago
    - Inicializar SDK con public_key
    - Configurar CardForm del SDK con todos los campos requeridos
    - Implementar validación en tiempo real de número de tarjeta
    - Implementar detección automática de tipo de tarjeta
    - Implementar validación de fecha de expiración y CVV
    - Mostrar mensajes de error específicos por campo
    - Habilitar botón de pago solo cuando todos los campos son válidos
    - Aplicar estilos consistentes con el diseño del e-commerce
    - Generar card_token al enviar formulario
    - Llamar a Edge Function process-payment con token
    - Manejar respuesta y mostrar resultado
    - _Requirements: 2.1, 2.2, 2.3, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [ ]* 9.2 Escribir property tests para CardForm
    - **Property 20: Card Validation**
    - **Property 21: Card Type Detection**
    - **Valida: Requirements 7.2, 7.3, 7.4**
  
  - [ ]* 9.3 Escribir unit tests para CardForm
    - Test para inicialización del SDK
    - Test para validación de número de tarjeta (Luhn)
    - Test para detección de tipo de tarjeta
    - Test para validación de fecha de expiración
    - Test para validación de CVV
    - Test para mensajes de error por campo
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 10. Implementar componente CheckoutProButton
  - [ ] 10.1 Crear componente CheckoutProButton para redirección
    - Crear interfaz CheckoutProButtonProps
    - Implementar onClick handler que llama a create-preference
    - Mostrar indicador de carga durante creación de preferencia
    - Redirigir a init_point cuando preferencia es creada exitosamente
    - Mostrar mensaje de error sin redirigir si falla creación
    - Abrir init_point en la misma ventana
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 10.2 Escribir property test para CheckoutProButton
    - **Property 22: Checkout Pro Flow**
    - **Valida: Requirements 8.1, 8.2, 8.4**
  
  - [ ]* 10.3 Escribir unit tests para CheckoutProButton
    - Test para creación de preferencia al hacer clic
    - Test para redirección a init_point
    - Test para error sin redirección
    - Test para indicador de carga
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

- [ ] 11. Implementar páginas de retorno y confirmación
  - [ ] 11.1 Crear componente ConfirmationPage para mostrar resultado de pago
    - Crear interfaz ConfirmationPageProps y OrderDetails
    - Extraer orderId, paymentId y status de URL params
    - Consultar estado actual de orden desde base de datos
    - Mostrar order_number y payment_id
    - Mostrar resumen de items comprados con total
    - Mostrar payment_status actual
    - Mostrar datos del comprador y dirección de envío
    - Vaciar Cart_Store cuando pago es aprobado
    - Mantener Cart_Store cuando pago es rechazado o cancelado
    - Proporcionar opción para descargar o imprimir confirmación
    - Mostrar explicación cuando pago está pendiente
    - Mostrar información de contacto para soporte
    - Crear páginas específicas para success, failure y pending
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 16.4, 16.5_
  
  - [ ]* 11.2 Escribir property tests para ConfirmationPage
    - **Property 23: Return URL Handling**
    - **Property 24: Cart Clearing on Success**
    - **Property 34: Cart Persistence During Payment**
    - **Valida: Requirements 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 16.3, 16.4, 16.5**
  
  - [ ]* 11.3 Escribir unit tests para ConfirmationPage
    - Test para extracción de params de URL
    - Test para consulta de estado de orden
    - Test para mostrar información correcta
    - Test para vaciar carrito en pago aprobado
    - Test para mantener carrito en pago rechazado
    - _Requirements: 9.5, 9.6, 9.7, 16.4, 16.5_

- [ ] 12. Checkpoint - Verificar flujos completos
  - Asegurar que todas las pruebas pasen, preguntar al usuario si surgen dudas.

- [ ] 13. Implementar configuración de credenciales y seguridad
  - [ ] 13.1 Configurar variables de entorno y gestión de credenciales
    - Crear archivo .env.example con todas las variables requeridas
    - Configurar MERCADOPAGO_ACCESS_TOKEN y MERCADOPAGO_PUBLIC_KEY
    - Configurar URLs de frontend y webhook
    - Configurar credenciales de Supabase
    - Implementar validación de credenciales al iniciar
    - Crear endpoint seguro para exponer public_key al frontend
    - Implementar validación para prevenir credenciales de test en producción
    - Configurar STATEMENT_DESCRIPTOR para estados de cuenta
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 20.6_
  
  - [ ]* 13.2 Escribir property tests para gestión de credenciales
    - **Property 25: Credentials Security**
    - **Property 26: Credentials Validation**
    - **Property 40: Test Credentials Protection**
    - **Valida: Requirements 11.2, 11.5, 11.6, 20.6**
  
  - [ ]* 13.3 Escribir unit tests para seguridad
    - Test para nunca exponer access_token al frontend
    - Test para nunca almacenar datos de tarjeta
    - Test para validación de firma de webhook
    - Test para prevenir credenciales de test en producción
    - _Requirements: 11.5, 2.8, 3.2, 20.6_

- [ ] 14. Implementar logging y monitoreo
  - [ ] 14.1 Implementar sistema de logging estructurado
    - Crear interfaz LogEntry con todos los campos requeridos
    - Implementar logging de cada llamada a API de Mercado Pago
    - Implementar logging de payment_id, order_id y status en transacciones
    - Implementar logging de notificaciones de webhook con payload
    - Implementar logging de errores con stack trace
    - Asegurar que no se registren datos sensibles (tarjetas, CVV, tokens)
    - Incluir request_id único en cada log para trazabilidad
    - Incluir environment flag (test/production) en logs
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 20.5_
  
  - [ ]* 14.2 Escribir property tests para logging
    - **Property 28: Error Logging**
    - **Property 37: API Call Logging**
    - **Property 38: Webhook Notification Logging**
    - **Property 39: Environment Flag Logging**
    - **Valida: Requirements 12.5, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 20.5**

- [ ] 15. Implementar manejo de errores y traducción
  - [ ] 15.1 Implementar sistema completo de manejo de errores
    - Crear interfaz ErrorResponse con estructura estándar
    - Implementar traducción de códigos de error de Mercado Pago a español
    - Implementar manejo de errores de validación (4xx)
    - Implementar manejo de errores de autenticación (401/403)
    - Implementar manejo de errores de servicios externos (502/503/504)
    - Implementar manejo de errores de rechazo de pago
    - Implementar manejo de errores de base de datos (500)
    - Crear mensajes de error descriptivos sin exponer detalles técnicos
    - Implementar opción de reintentar después de error
    - _Requirements: 1.6, 2.7, 12.1, 12.2, 12.3, 12.4, 12.6, 12.7_
  
  - [ ]* 15.2 Escribir property tests para manejo de errores
    - **Property 5: Error Messages on Failure**
    - **Property 27: Error Code Translation**
    - **Property 29: Token Expiration Handling**
    - **Valida: Requirements 1.6, 2.7, 12.1, 12.2, 12.4, 12.7**
  
  - [ ]* 15.3 Escribir unit tests para traducción de errores
    - Test para traducción de códigos conocidos
    - Test para mensaje default en códigos desconocidos
    - Test para todos los mensajes en español
    - Test para no exponer detalles técnicos
    - _Requirements: 12.2, 12.4_

- [ ] 16. Implementar validaciones de estado y transiciones
  - [ ] 16.1 Implementar lógica de transiciones de estado de órdenes
    - Implementar función para validar transiciones de estado permitidas
    - Implementar prevención de transiciones inválidas (paid → pending)
    - Implementar registro de paid_at al cambiar a estado paid
    - Implementar creación de registro en order_status_history
    - Implementar validación de estado actual antes de actualizar
    - _Requirements: 4.4, 4.5, 4.6, 4.7_
  
  - [ ]* 16.2 Escribir property tests para transiciones de estado
    - **Property 13: Valid State Transitions**
    - **Property 14: Payment Date Recording**
    - **Property 15: State Change History**
    - **Valida: Requirements 4.4, 4.5, 4.6, 4.7**
  
  - [ ]* 16.3 Escribir unit tests para transiciones de estado
    - Test para transiciones válidas
    - Test para prevención de transiciones inválidas
    - Test para registro de paid_at
    - Test para creación de historial
    - _Requirements: 4.4, 4.5, 4.6, 4.7_

- [ ] 17. Implementar soporte para múltiples métodos de pago
  - [ ] 17.1 Configurar soporte para métodos de pago de Chile
    - Configurar currency como "CLP" en todas las llamadas a API
    - Configurar métodos de pago aceptados (Visa, Mastercard, Amex, débito)
    - Mostrar iconos de métodos de pago en Checkout API
    - Aplicar configuraciones específicas de Mercado Pago para Chile
    - Almacenar método de pago usado en orden
    - Mostrar método de pago en confirmación
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_
  
  - [ ]* 17.2 Escribir property test para configuración de moneda
    - **Property 35: Currency Configuration**
    - **Valida: Requirements 17.4**

- [ ] 18. Implementar timeout y reintentos
  - [ ] 18.1 Configurar timeout y estrategia de reintentos
    - Configurar timeout de 30 segundos para llamadas a Mercado Pago
    - Implementar retry automático hasta 2 veces en Edge Functions
    - Implementar backoff exponencial entre reintentos (1s, 2s)
    - Retornar error al frontend si todos los reintentos fallan
    - Configurar timeout de 10 segundos para webhook
    - No implementar retry en webhook (Mercado Pago reintentará)
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_
  
  - [ ]* 18.2 Escribir property test para timeout y reintentos
    - **Property 36: Timeout and Retry Behavior**
    - **Valida: Requirements 18.2, 18.4**

- [ ] 19. Checkpoint final - Integración completa
  - Asegurar que todas las pruebas pasen, preguntar al usuario si surgen dudas.

- [ ] 20. Configurar ambiente de testing
  - [ ] 20.1 Configurar credenciales y datos de prueba
    - Configurar credenciales de test de Mercado Pago
    - Documentar tarjetas de prueba para testing (Visa, Mastercard, Amex)
    - Configurar webhook para recibir notificaciones de test
    - Crear datos de prueba para órdenes y transacciones
    - Configurar flag de ambiente visible en logs
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_
  
  - [ ]* 20.2 Escribir tests de integración end-to-end
    - Test para flujo completo de Checkout Pro
    - Test para flujo completo de Checkout API
    - Test para procesamiento de webhook
    - Test para políticas RLS
    - Test para transiciones de estado
    - _Requirements: 20.1, 20.2, 20.3, 20.4_

- [ ] 21. Checkpoint final - Sistema completo
  - Asegurar que todas las pruebas pasen, preguntar al usuario si surgen dudas.

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los property tests validan propiedades de corrección universales
- Los unit tests validan ejemplos específicos y casos edge
- El sistema usa TypeScript tanto en frontend como en backend (Deno)
- Todas las cantidades monetarias están en CLP (Peso Chileno)
- El sistema soporta ambiente de test y producción con credenciales separadas
