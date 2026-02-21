# Requirements Document

## Introduction

Este documento especifica los requisitos para implementar un sistema completo de procesamiento de pagos con Mercado Pago en un e-commerce operando en Chile. El sistema soportará dos métodos de integración: Checkout Pro (redirección) y Checkout API (formulario integrado), utilizando Supabase Edge Functions como backend y React/TypeScript en el frontend.

## Glossary

- **Payment_System**: El sistema completo de procesamiento de pagos con Mercado Pago
- **Checkout_Pro**: Método de integración que redirige al usuario a la página de pago de Mercado Pago
- **Checkout_API**: Método de integración con formulario de pago embebido en el sitio
- **Edge_Function**: Función serverless de Supabase que maneja la lógica del backend
- **Payment_Preference**: Objeto de configuración de pago para Checkout Pro
- **Payment_Token**: Token de tarjeta generado por el SDK de Mercado Pago
- **Webhook**: Endpoint que recibe notificaciones de estado de pago desde Mercado Pago
- **Order**: Registro de compra en la base de datos con productos y estado de pago
- **Payment_Transaction**: Registro de transacción de pago con detalles de Mercado Pago
- **Cart_Store**: Store de Zustand que mantiene el estado del carrito de compras
- **Buyer**: Usuario que realiza la compra
- **Payment_Status**: Estado del pago (pending, approved, rejected, cancelled, in_process)

## Requirements

### Requirement 1: Crear Preferencia de Pago para Checkout Pro

**User Story:** Como comprador, quiero poder pagar usando Checkout Pro de Mercado Pago, para completar mi compra de forma segura mediante redirección

#### Acceptance Criteria

1. WHEN el Buyer selecciona Checkout Pro, THE Payment_System SHALL crear una Order en estado "pending"
2. WHEN se crea una Order, THE Edge_Function SHALL generar una Payment_Preference con los items del Cart_Store
3. THE Payment_Preference SHALL incluir URLs de retorno (success, failure, pending)
4. THE Payment_Preference SHALL incluir información del Buyer (email, nombre, teléfono)
5. WHEN la Payment_Preference es creada exitosamente, THE Payment_System SHALL retornar el preference_id y init_point
6. IF la creación de Payment_Preference falla, THEN THE Payment_System SHALL retornar un mensaje de error descriptivo
7. THE Payment_System SHALL almacenar el preference_id en la Order

### Requirement 2: Procesar Pago con Checkout API

**User Story:** Como comprador, quiero ingresar mis datos de tarjeta directamente en el sitio, para tener una experiencia de pago más fluida sin salir del e-commerce

#### Acceptance Criteria

1. WHEN el Buyer selecciona Checkout API, THE Payment_System SHALL mostrar un formulario de tarjeta
2. THE Payment_System SHALL cargar el SDK de Mercado Pago con la public key
3. WHEN el Buyer completa los datos de tarjeta, THE Payment_System SHALL generar un Payment_Token usando el SDK
4. THE Payment_System SHALL enviar el Payment_Token al Edge_Function junto con datos de la Order
5. THE Edge_Function SHALL procesar el pago usando la API de Mercado Pago con el Payment_Token
6. WHEN el pago es procesado, THE Edge_Function SHALL retornar el Payment_Status y payment_id
7. IF el Payment_Token es inválido, THEN THE Payment_System SHALL mostrar un error de validación
8. THE Payment_System SHALL nunca almacenar datos de tarjeta en texto plano

### Requirement 3: Recibir y Validar Notificaciones de Webhook

**User Story:** Como sistema, necesito recibir notificaciones de Mercado Pago, para actualizar automáticamente el estado de las órdenes cuando cambia el estado del pago

#### Acceptance Criteria

1. THE Webhook SHALL estar expuesto como un Edge_Function público
2. WHEN Mercado Pago envía una notificación, THE Webhook SHALL validar la firma x-signature
3. WHEN la notificación es de tipo "payment", THE Webhook SHALL consultar el estado del pago en la API de Mercado Pago
4. THE Webhook SHALL actualizar el Payment_Status de la Order correspondiente
5. WHEN el Payment_Status cambia a "approved", THE Webhook SHALL actualizar la Order a estado "paid"
6. WHEN el Payment_Status cambia a "rejected", THE Webhook SHALL actualizar la Order a estado "failed"
7. IF la validación de firma falla, THEN THE Webhook SHALL retornar HTTP 401 y no procesar la notificación
8. THE Webhook SHALL retornar HTTP 200 a Mercado Pago después de procesar exitosamente
9. THE Webhook SHALL ser idempotente para manejar notificaciones duplicadas

### Requirement 4: Gestionar Estados de Órdenes

**User Story:** Como sistema, necesito mantener un registro preciso de las órdenes y sus estados de pago, para garantizar la integridad de las transacciones

#### Acceptance Criteria

1. WHEN se crea una Order, THE Payment_System SHALL asignar estado inicial "pending"
2. THE Order SHALL incluir buyer_id, items, total_amount, currency y timestamp
3. WHEN se crea una Order, THE Payment_System SHALL generar un order_number único
4. THE Payment_System SHALL permitir transiciones de estado: pending → paid, pending → failed, pending → cancelled
5. THE Payment_System SHALL prevenir transiciones de estado inválidas (paid → pending)
6. WHEN una Order cambia a estado "paid", THE Payment_System SHALL registrar payment_date
7. THE Payment_System SHALL mantener un historial de cambios de estado con timestamps

### Requirement 5: Registrar Transacciones de Pago

**User Story:** Como administrador, necesito un registro detallado de todas las transacciones, para auditoría y reconciliación con Mercado Pago

#### Acceptance Criteria

1. WHEN se procesa un pago, THE Payment_System SHALL crear un Payment_Transaction
2. THE Payment_Transaction SHALL incluir payment_id de Mercado Pago, order_id, amount, Payment_Status
3. THE Payment_Transaction SHALL incluir payment_method_id y payment_type_id
4. WHEN se recibe una actualización de Webhook, THE Payment_System SHALL actualizar el Payment_Transaction correspondiente
5. THE Payment_Transaction SHALL almacenar la respuesta completa de Mercado Pago como JSON
6. THE Payment_System SHALL relacionar cada Payment_Transaction con exactamente una Order

### Requirement 6: Implementar Página de Checkout

**User Story:** Como comprador, quiero una página de checkout clara donde pueda revisar mi orden e ingresar mis datos, para completar mi compra con confianza

#### Acceptance Criteria

1. THE Payment_System SHALL mostrar un resumen de items del Cart_Store con precios y total
2. THE Payment_System SHALL solicitar datos del Buyer (nombre, email, teléfono, dirección)
3. THE Payment_System SHALL validar formato de email y teléfono antes de proceder
4. THE Payment_System SHALL mostrar opciones de método de pago (Checkout Pro y Checkout API)
5. WHEN el Buyer selecciona un método de pago, THE Payment_System SHALL mostrar la interfaz correspondiente
6. THE Payment_System SHALL deshabilitar el botón de pago mientras se procesa la transacción
7. THE Payment_System SHALL mostrar indicadores de carga durante el procesamiento

### Requirement 7: Implementar Formulario de Tarjeta (Checkout API)

**User Story:** Como comprador usando Checkout API, quiero un formulario de tarjeta intuitivo con validación en tiempo real, para ingresar mis datos de pago correctamente

#### Acceptance Criteria

1. THE Payment_System SHALL usar el componente Card Form del SDK de Mercado Pago
2. THE Payment_System SHALL validar número de tarjeta en tiempo real
3. THE Payment_System SHALL detectar automáticamente el tipo de tarjeta (Visa, Mastercard, etc.)
4. THE Payment_System SHALL validar fecha de expiración y código de seguridad
5. THE Payment_System SHALL mostrar mensajes de error específicos por campo
6. WHEN todos los campos son válidos, THE Payment_System SHALL habilitar el botón de pago
7. THE Payment_System SHALL aplicar estilos consistentes con el diseño del e-commerce

### Requirement 8: Implementar Botón de Pago (Checkout Pro)

**User Story:** Como comprador usando Checkout Pro, quiero un botón claro que me lleve a la página de pago de Mercado Pago, para completar mi compra de forma segura

#### Acceptance Criteria

1. WHEN el Buyer hace clic en el botón de Checkout Pro, THE Payment_System SHALL crear la Payment_Preference
2. WHEN la Payment_Preference es creada, THE Payment_System SHALL redirigir al Buyer al init_point
3. THE Payment_System SHALL abrir el init_point en la misma ventana
4. IF la creación de Payment_Preference falla, THEN THE Payment_System SHALL mostrar un mensaje de error sin redirigir
5. THE Payment_System SHALL mostrar un indicador de carga mientras se crea la Payment_Preference

### Requirement 9: Manejar Retorno desde Checkout Pro

**User Story:** Como comprador que completó el pago en Mercado Pago, quiero ser redirigido de vuelta al e-commerce con información clara del resultado, para saber si mi pago fue exitoso

#### Acceptance Criteria

1. THE Payment_System SHALL definir URLs de retorno para success, failure y pending
2. WHEN Mercado Pago redirige a la URL de success, THE Payment_System SHALL mostrar página de confirmación
3. WHEN Mercado Pago redirige a la URL de failure, THE Payment_System SHALL mostrar página de error con opción de reintentar
4. WHEN Mercado Pago redirige a la URL de pending, THE Payment_System SHALL mostrar página de pago pendiente
5. THE Payment_System SHALL extraer payment_id y status de los query parameters
6. THE Payment_System SHALL consultar el estado actual de la Order desde la base de datos
7. THE Payment_System SHALL vaciar el Cart_Store cuando el pago es aprobado

### Requirement 10: Implementar Página de Confirmación

**User Story:** Como comprador con pago aprobado, quiero ver una confirmación clara de mi compra con detalles de la orden, para tener registro de mi transacción

#### Acceptance Criteria

1. THE Payment_System SHALL mostrar el order_number y payment_id
2. THE Payment_System SHALL mostrar resumen de items comprados con total
3. THE Payment_System SHALL mostrar Payment_Status actual
4. THE Payment_System SHALL mostrar datos del Buyer y dirección de envío
5. THE Payment_System SHALL proporcionar opción para descargar o imprimir la confirmación
6. WHEN el Payment_Status es "pending", THE Payment_System SHALL explicar que el pago está en proceso
7. THE Payment_System SHALL mostrar información de contacto para soporte

### Requirement 11: Gestionar Credenciales de Mercado Pago

**User Story:** Como desarrollador, necesito gestionar las credenciales de Mercado Pago de forma segura, para proteger las claves de acceso a la API

#### Acceptance Criteria

1. THE Payment_System SHALL almacenar access_token y public_key en variables de entorno
2. THE Edge_Function SHALL usar access_token para llamadas a la API de Mercado Pago
3. THE Payment_System SHALL exponer public_key al frontend de forma segura
4. THE Payment_System SHALL soportar credenciales de test y producción
5. THE Payment_System SHALL nunca exponer access_token al frontend
6. THE Payment_System SHALL validar que las credenciales estén configuradas antes de procesar pagos

### Requirement 12: Implementar Manejo de Errores

**User Story:** Como comprador, quiero recibir mensajes de error claros cuando algo falla, para entender qué salió mal y cómo solucionarlo

#### Acceptance Criteria

1. WHEN un pago es rechazado, THE Payment_System SHALL mostrar el motivo del rechazo
2. THE Payment_System SHALL traducir códigos de error de Mercado Pago a mensajes en español
3. WHEN hay un error de red, THE Payment_System SHALL mostrar mensaje de error de conexión
4. WHEN hay un error del servidor, THE Payment_System SHALL mostrar mensaje genérico sin exponer detalles técnicos
5. THE Payment_System SHALL registrar errores en logs del servidor para debugging
6. THE Payment_System SHALL proporcionar opción de reintentar después de un error
7. IF el Payment_Token expira, THEN THE Payment_System SHALL solicitar generar uno nuevo

### Requirement 13: Implementar Validación de Montos

**User Story:** Como sistema, necesito validar que los montos de pago coincidan con el total del carrito, para prevenir manipulación de precios

#### Acceptance Criteria

1. WHEN se crea una Order, THE Edge_Function SHALL recalcular el total basado en los items
2. THE Edge_Function SHALL comparar el total calculado con el total enviado desde el frontend
3. IF los totales no coinciden, THEN THE Edge_Function SHALL rechazar la Order con error de validación
4. THE Edge_Function SHALL validar que todos los items existan en la base de datos
5. THE Edge_Function SHALL usar los precios actuales de la base de datos, no los del frontend
6. THE Edge_Function SHALL validar que las cantidades sean números positivos

### Requirement 14: Implementar Esquema de Base de Datos

**User Story:** Como sistema, necesito un esquema de base de datos bien estructurado, para almacenar órdenes y transacciones de forma relacional

#### Acceptance Criteria

1. THE Payment_System SHALL crear tabla "orders" con columnas: id, order_number, buyer_id, items, total_amount, currency, status, payment_method, created_at, updated_at, paid_at
2. THE Payment_System SHALL crear tabla "payment_transactions" con columnas: id, order_id, payment_id, status, amount, payment_method_id, payment_type_id, response_data, created_at, updated_at
3. THE Payment_System SHALL definir foreign key de payment_transactions.order_id a orders.id
4. THE Payment_System SHALL definir foreign key de orders.buyer_id a auth.users.id
5. THE Payment_System SHALL crear índice en orders.order_number para búsquedas rápidas
6. THE Payment_System SHALL crear índice en payment_transactions.payment_id
7. THE Payment_System SHALL definir constraint unique en orders.order_number

### Requirement 15: Implementar Políticas de Seguridad RLS

**User Story:** Como sistema, necesito proteger los datos de órdenes y pagos, para que cada usuario solo pueda acceder a sus propias transacciones

#### Acceptance Criteria

1. THE Payment_System SHALL habilitar Row Level Security en tabla "orders"
2. THE Payment_System SHALL habilitar Row Level Security en tabla "payment_transactions"
3. THE Payment_System SHALL crear política que permita a usuarios ver solo sus propias orders
4. THE Payment_System SHALL crear política que permita a usuarios crear orders solo con su propio buyer_id
5. THE Payment_System SHALL crear política que permita a usuarios ver payment_transactions solo de sus orders
6. THE Edge_Function SHALL usar service_role key para operaciones de Webhook
7. THE Payment_System SHALL prevenir modificación directa de orders por usuarios

### Requirement 16: Implementar Integración con Cart Store

**User Story:** Como comprador, quiero que mi carrito se sincronice correctamente con el proceso de pago, para asegurar que estoy pagando por los productos correctos

#### Acceptance Criteria

1. WHEN el Buyer accede al checkout, THE Payment_System SHALL leer items del Cart_Store
2. THE Payment_System SHALL validar que el Cart_Store no esté vacío antes de mostrar checkout
3. WHEN se crea una Order exitosamente, THE Payment_System SHALL mantener el Cart_Store hasta confirmar el pago
4. WHEN el pago es aprobado, THE Payment_System SHALL vaciar el Cart_Store
5. IF el Buyer cancela el pago, THEN THE Payment_System SHALL mantener el Cart_Store intacto
6. THE Payment_System SHALL calcular el total sumando price × quantity de cada item

### Requirement 17: Implementar Soporte para Múltiples Métodos de Pago

**User Story:** Como comprador, quiero ver qué métodos de pago están disponibles en Chile, para elegir el que prefiero usar

#### Acceptance Criteria

1. THE Payment_System SHALL soportar tarjetas de crédito (Visa, Mastercard, American Express)
2. THE Payment_System SHALL soportar tarjetas de débito
3. THE Checkout_API SHALL mostrar iconos de los métodos de pago aceptados
4. THE Payment_System SHALL configurar currency como "CLP" para Chile
5. THE Payment_System SHALL aplicar configuraciones específicas de Mercado Pago para Chile
6. THE Payment_System SHALL mostrar el método de pago usado en la confirmación de Order

### Requirement 18: Implementar Timeout y Reintentos

**User Story:** Como sistema, necesito manejar timeouts y reintentos de forma inteligente, para mejorar la confiabilidad ante problemas de red

#### Acceptance Criteria

1. THE Edge_Function SHALL configurar timeout de 30 segundos para llamadas a API de Mercado Pago
2. WHEN una llamada a Mercado Pago falla por timeout, THE Edge_Function SHALL reintentar hasta 2 veces
3. THE Edge_Function SHALL usar backoff exponencial entre reintentos (1s, 2s)
4. IF todos los reintentos fallan, THEN THE Edge_Function SHALL retornar error al frontend
5. THE Webhook SHALL procesar notificaciones con timeout de 10 segundos
6. THE Webhook SHALL no reintentar automáticamente (Mercado Pago reintentará)

### Requirement 19: Implementar Logging y Monitoreo

**User Story:** Como desarrollador, necesito logs detallados de las transacciones, para diagnosticar problemas y monitorear el sistema

#### Acceptance Criteria

1. THE Edge_Function SHALL registrar cada llamada a API de Mercado Pago con timestamp
2. THE Edge_Function SHALL registrar payment_id, order_id y status en cada transacción
3. THE Webhook SHALL registrar cada notificación recibida con su payload
4. THE Payment_System SHALL registrar errores con stack trace completo
5. THE Payment_System SHALL no registrar datos sensibles (números de tarjeta, CVV)
6. THE Payment_System SHALL incluir request_id único en cada log para trazabilidad

### Requirement 20: Implementar Pruebas de Integración

**User Story:** Como desarrollador, necesito poder probar el flujo completo de pago en ambiente de test, para validar la integración antes de producción

#### Acceptance Criteria

1. THE Payment_System SHALL soportar credenciales de test de Mercado Pago
2. THE Payment_System SHALL proporcionar tarjetas de prueba documentadas para testing
3. THE Payment_System SHALL permitir simular pagos aprobados, rechazados y pendientes
4. THE Webhook SHALL funcionar con notificaciones de test de Mercado Pago
5. THE Payment_System SHALL incluir flag de ambiente (test/production) visible en logs
6. THE Payment_System SHALL prevenir uso de credenciales de test en producción

