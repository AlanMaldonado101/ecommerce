# Documento de Requisitos: Integración de Checkout con Mercado Pago

## Introducción

Este documento define los requisitos para implementar un sistema completo de checkout con Mercado Pago en la tienda Jireh. La integración permitirá a los clientes realizar compras utilizando Checkout Pro (redirección) y procesar pagos de forma segura. El sistema debe manejar la creación de órdenes, procesamiento de pagos, actualización de estados y gestión de inventario.

## Glosario

- **Checkout_System**: El sistema completo de procesamiento de compras que coordina la creación de órdenes y pagos
- **Payment_Gateway**: La interfaz con Mercado Pago que maneja la creación de preferencias y procesamiento de pagos
- **Order_Manager**: El componente que gestiona la creación y actualización de órdenes en la base de datos
- **Inventory_Manager**: El componente que controla y actualiza el stock de productos
- **Preference**: Objeto de Mercado Pago que contiene la información de pago y redirección
- **Buyer**: Usuario autenticado que realiza una compra
- **Cart_Item**: Producto con variante y cantidad seleccionada para compra
- **Order**: Registro de compra que incluye items, dirección de envío y estado de pago
- **Payment_Status**: Estado del pago (pending, approved, rejected, cancelled)
- **Order_Status**: Estado de la orden (pending, paid, processing, shipped, delivered, cancelled)

## Requisitos

### Requisito 1: Configuración de Credenciales de Mercado Pago

**User Story:** Como desarrollador, quiero configurar las credenciales de Mercado Pago, para que el sistema pueda comunicarse con la API de pagos.

#### Criterios de Aceptación

1. THE Checkout_System SHALL almacenar la clave pública de Mercado Pago en variables de entorno del frontend (VITE_MERCADOPAGO_PUBLIC_KEY)
2. THE Checkout_System SHALL almacenar el access token de Mercado Pago en secretos de Supabase Edge Functions (MERCADOPAGO_ACCESS_TOKEN)
3. THE Checkout_System SHALL almacenar la URL del frontend en secretos de Supabase (FRONTEND_URL)
4. WHEN las credenciales no están configuradas, THE Checkout_System SHALL mostrar un error descriptivo al intentar iniciar un pago
5. THE Checkout_System SHALL utilizar credenciales de prueba para el ambiente de desarrollo

### Requisito 2: Validación de Stock Antes de Checkout

**User Story:** Como cliente, quiero que el sistema valide el stock disponible antes de proceder al pago, para que no pueda comprar productos sin inventario.

#### Criterios de Aceptación

1. WHEN un Buyer inicia el checkout, THE Inventory_Manager SHALL verificar que cada Cart_Item tenga stock suficiente
2. IF algún Cart_Item no tiene stock suficiente, THEN THE Checkout_System SHALL mostrar un mensaje de error indicando qué productos no están disponibles
3. THE Inventory_Manager SHALL verificar el stock en tiempo real consultando la base de datos
4. WHEN el stock es insuficiente, THE Checkout_System SHALL prevenir la creación de la preferencia de pago
5. THE Checkout_System SHALL mostrar la cantidad disponible para productos con stock insuficiente

### Requisito 3: Creación de Preferencia de Pago

**User Story:** Como cliente, quiero que el sistema cree una preferencia de pago en Mercado Pago, para que pueda ser redirigido a completar mi compra.

#### Criterios de Aceptación

1. WHEN un Buyer confirma el checkout, THE Payment_Gateway SHALL crear una preferencia de pago en Mercado Pago
2. THE Payment_Gateway SHALL incluir todos los Cart_Items con nombre, cantidad, precio unitario e imagen
3. THE Payment_Gateway SHALL incluir los datos del comprador (nombre, email, teléfono, dirección completa)
4. THE Payment_Gateway SHALL configurar URLs de retorno (success, failure, pending)
5. THE Payment_Gateway SHALL retornar el preference_id y el init_point para redirección
6. WHEN la creación de preferencia falla, THE Payment_Gateway SHALL retornar un mensaje de error descriptivo
7. THE Payment_Gateway SHALL configurar el modo de pago como "modal" para mejor experiencia de usuario

### Requisito 4: Creación de Orden Pendiente

**User Story:** Como sistema, quiero crear una orden en estado pendiente al generar la preferencia de pago, para que pueda rastrear el proceso de compra desde el inicio.

#### Criterios de Aceptación

1. WHEN THE Payment_Gateway crea una preferencia exitosamente, THE Order_Manager SHALL crear una Order en la base de datos
2. THE Order_Manager SHALL asignar un ID único (UUID) a la Order
3. THE Order_Manager SHALL generar un número de orden secuencial legible para el usuario
4. THE Order_Manager SHALL almacenar el preference_id de Mercado Pago en la Order
5. THE Order_Manager SHALL establecer el Order_Status inicial como "pending"
6. THE Order_Manager SHALL almacenar los Cart_Items como JSONB en la Order
7. THE Order_Manager SHALL almacenar los datos del comprador como JSONB en la Order
8. THE Order_Manager SHALL registrar el buyer_id del usuario autenticado
9. THE Order_Manager SHALL calcular y almacenar el monto total de la Order

### Requisito 5: Redirección a Checkout Pro

**User Story:** Como cliente, quiero ser redirigido a la página de pago de Mercado Pago, para que pueda completar mi compra de forma segura.

#### Criterios de Aceptación

1. WHEN la Preference es creada exitosamente, THE Checkout_System SHALL redirigir al Buyer al init_point de Mercado Pago
2. THE Checkout_System SHALL abrir el checkout en una nueva ventana o modal
3. THE Checkout_System SHALL mostrar un indicador de carga mientras se crea la preferencia
4. WHEN la redirección falla, THE Checkout_System SHALL mostrar un mensaje de error y mantener al usuario en la página de checkout

### Requisito 6: Procesamiento de Retorno de Pago

**User Story:** Como cliente, quiero ser redirigido de vuelta a la tienda después de completar el pago, para que pueda ver el resultado de mi compra.

#### Criterios de Aceptación

1. WHEN Mercado Pago procesa el pago, THE Checkout_System SHALL recibir al Buyer en la URL de retorno configurada
2. THE Checkout_System SHALL extraer los parámetros de la URL (payment_id, status, external_reference)
3. WHEN el pago es aprobado, THE Checkout_System SHALL redirigir al Buyer a una página de confirmación
4. WHEN el pago es rechazado, THE Checkout_System SHALL redirigir al Buyer a una página de error con detalles
5. WHEN el pago está pendiente, THE Checkout_System SHALL redirigir al Buyer a una página informativa
6. THE Checkout_System SHALL mostrar el número de orden en todas las páginas de resultado

### Requisito 7: Actualización de Estado de Orden por Webhook

**User Story:** Como sistema, quiero recibir notificaciones de Mercado Pago cuando cambia el estado de un pago, para que pueda actualizar las órdenes automáticamente.

#### Criterios de Aceptación

1. WHEN Mercado Pago envía una notificación de pago, THE Payment_Gateway SHALL recibir el webhook
2. THE Payment_Gateway SHALL validar la autenticidad del webhook usando la firma de Mercado Pago
3. WHEN el webhook es válido, THE Payment_Gateway SHALL consultar los detalles del pago en la API de Mercado Pago
4. THE Order_Manager SHALL actualizar el Order_Status basado en el Payment_Status recibido
5. WHEN el Payment_Status es "approved", THE Order_Manager SHALL cambiar Order_Status a "paid"
6. WHEN el Payment_Status es "rejected", THE Order_Manager SHALL cambiar Order_Status a "cancelled"
7. THE Order_Manager SHALL registrar la fecha de pago (paid_at) cuando el pago es aprobado
8. THE Order_Manager SHALL almacenar el método de pago utilizado
9. THE Order_Manager SHALL registrar el payment_id de Mercado Pago
10. IF el webhook es inválido o no puede ser procesado, THEN THE Payment_Gateway SHALL retornar un error HTTP 400

### Requisito 8: Actualización de Inventario Post-Pago

**User Story:** Como administrador, quiero que el inventario se actualice automáticamente cuando un pago es aprobado, para que el stock refleje las ventas realizadas.

#### Criterios de Aceptación

1. WHEN una Order cambia a estado "paid", THE Inventory_Manager SHALL reducir el stock de cada variante en la Order
2. THE Inventory_Manager SHALL restar la cantidad exacta de cada Cart_Item del stock disponible
3. THE Inventory_Manager SHALL realizar la actualización de stock de forma atómica para evitar condiciones de carrera
4. IF el stock resulta negativo después de la actualización, THEN THE Inventory_Manager SHALL registrar una alerta en los logs
5. THE Inventory_Manager SHALL actualizar el stock solo una vez por Order para evitar duplicaciones

### Requisito 9: Consulta de Órdenes por Cliente

**User Story:** Como cliente, quiero ver el historial de mis órdenes, para que pueda revisar mis compras anteriores y su estado actual.

#### Criterios de Aceptación

1. WHEN un Buyer autenticado solicita sus órdenes, THE Order_Manager SHALL retornar todas las Orders asociadas a su buyer_id
2. THE Order_Manager SHALL ordenar las Orders por fecha de creación descendente (más recientes primero)
3. THE Order_Manager SHALL incluir para cada Order: número de orden, monto total, estado, fecha de creación
4. THE Order_Manager SHALL filtrar solo las Orders del Buyer autenticado usando RLS (Row Level Security)
5. WHEN un usuario no autenticado intenta consultar órdenes, THE Order_Manager SHALL retornar un error de autenticación

### Requisito 10: Detalle de Orden Individual

**User Story:** Como cliente, quiero ver los detalles completos de una orden específica, para que pueda revisar qué productos compré y el estado del envío.

#### Criterios de Aceptación

1. WHEN un Buyer solicita el detalle de una Order, THE Order_Manager SHALL retornar toda la información de la Order
2. THE Order_Manager SHALL incluir los datos del comprador (nombre, email, dirección de envío)
3. THE Order_Manager SHALL incluir todos los Cart_Items con nombre, cantidad, precio, imagen
4. THE Order_Manager SHALL incluir el Order_Status actual y la fecha de creación
5. THE Order_Manager SHALL incluir el método de pago y fecha de pago si está disponible
6. THE Order_Manager SHALL verificar que la Order pertenece al Buyer autenticado antes de retornar los datos
7. IF la Order no pertenece al Buyer, THEN THE Order_Manager SHALL retornar un error de autorización

### Requisito 11: Manejo de Errores de Pago

**User Story:** Como cliente, quiero recibir mensajes claros cuando un pago falla, para que pueda entender qué salió mal y cómo solucionarlo.

#### Criterios de Aceptación

1. WHEN un pago es rechazado por fondos insuficientes, THE Checkout_System SHALL mostrar un mensaje indicando "Fondos insuficientes"
2. WHEN un pago es rechazado por datos de tarjeta inválidos, THE Checkout_System SHALL mostrar un mensaje indicando "Datos de tarjeta inválidos"
3. WHEN un pago es rechazado por otros motivos, THE Checkout_System SHALL mostrar el mensaje de error proporcionado por Mercado Pago
4. THE Checkout_System SHALL mantener la Order en estado "pending" cuando un pago falla
5. THE Checkout_System SHALL permitir al Buyer reintentar el pago con la misma Order
6. THE Checkout_System SHALL registrar todos los intentos de pago fallidos en los logs del sistema

### Requisito 12: Seguridad y Validación de Datos

**User Story:** Como administrador, quiero que el sistema valide y proteja todos los datos de pago, para que la tienda sea segura contra fraudes y manipulaciones.

#### Criterios de Aceptación

1. THE Payment_Gateway SHALL validar que el monto total enviado al frontend coincide con el calculado en el backend
2. THE Payment_Gateway SHALL validar que todos los precios de Cart_Items coinciden con los precios en la base de datos
3. THE Payment_Gateway SHALL validar que el Buyer está autenticado antes de crear una Preference
4. THE Order_Manager SHALL aplicar políticas RLS para que los Buyers solo puedan acceder a sus propias Orders
5. THE Payment_Gateway SHALL sanitizar todos los datos de entrada para prevenir inyección SQL
6. THE Checkout_System SHALL nunca exponer el access token de Mercado Pago en el frontend
7. THE Payment_Gateway SHALL validar la firma de los webhooks de Mercado Pago antes de procesarlos
8. THE Checkout_System SHALL usar HTTPS para todas las comunicaciones con Mercado Pago

### Requisito 13: Configuración de URLs de Retorno

**User Story:** Como desarrollador, quiero configurar las URLs de retorno para diferentes resultados de pago, para que los clientes sean redirigidos correctamente después del checkout.

#### Criterios de Aceptación

1. THE Payment_Gateway SHALL configurar una URL de retorno para pagos exitosos que incluya el order_id
2. THE Payment_Gateway SHALL configurar una URL de retorno para pagos fallidos que incluya el motivo del rechazo
3. THE Payment_Gateway SHALL configurar una URL de retorno para pagos pendientes
4. THE Payment_Gateway SHALL usar la variable de entorno FRONTEND_URL como base para las URLs de retorno
5. THE Checkout_System SHALL crear rutas en el frontend para manejar cada tipo de retorno (/checkout/success, /checkout/failure, /checkout/pending)

### Requisito 14: Pruebas con Credenciales de Test

**User Story:** Como desarrollador, quiero poder probar el flujo completo de pago usando credenciales de prueba, para que pueda verificar la integración sin realizar transacciones reales.

#### Criterios de Aceptación

1. WHERE el ambiente es desarrollo, THE Checkout_System SHALL usar la clave de prueba de Mercado Pago (TEST-*)
2. THE Checkout_System SHALL permitir usar tarjetas de prueba de Mercado Pago para simular diferentes escenarios
3. THE Checkout_System SHALL procesar pagos de prueba de la misma forma que pagos reales
4. THE Checkout_System SHALL marcar claramente en la interfaz cuando se está usando el modo de prueba
5. THE Order_Manager SHALL almacenar Orders de prueba en la misma base de datos con un indicador de test

### Requisito 15: Logging y Monitoreo

**User Story:** Como administrador, quiero que el sistema registre todas las transacciones y errores, para que pueda diagnosticar problemas y auditar pagos.

#### Criterios de Aceptación

1. THE Payment_Gateway SHALL registrar cada intento de creación de preferencia con timestamp y datos del comprador
2. THE Payment_Gateway SHALL registrar cada webhook recibido con su contenido completo
3. THE Order_Manager SHALL registrar cada cambio de Order_Status con timestamp y motivo
4. THE Inventory_Manager SHALL registrar cada actualización de stock con order_id y cantidad
5. WHEN ocurre un error, THE Checkout_System SHALL registrar el stack trace completo y contexto del error
6. THE Checkout_System SHALL incluir el order_id en todos los logs relacionados con una Order específica
7. THE Checkout_System SHALL usar niveles de log apropiados (info, warning, error) para facilitar el filtrado
