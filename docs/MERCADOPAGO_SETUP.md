# Configuración de MercadoPago en Producción

Este documento describe cómo configurar las credenciales de MercadoPago para el sistema de checkout en producción.

## Variables de Entorno del Frontend

### VITE_MERCADOPAGO_PUBLIC_KEY

Esta variable debe configurarse en el archivo `.env` del frontend (o en las variables de entorno de tu plataforma de hosting).

**Desarrollo (Credenciales de Prueba):**
```bash
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Producción (Credenciales Reales):**
```bash
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Cómo obtener la clave pública:

1. Ingresa a tu cuenta de MercadoPago
2. Ve a **Tus integraciones** > **Credenciales**
3. Selecciona el modo (Prueba o Producción)
4. Copia la **Public Key**

## Secretos de Supabase Edge Functions

Los siguientes secretos deben configurarse en Supabase para que las Edge Functions puedan comunicarse con MercadoPago.

### MERCADOPAGO_ACCESS_TOKEN

Este es el Access Token privado de MercadoPago que se usa en el backend para crear preferencias y consultar pagos.

**⚠️ IMPORTANTE:** Este token NUNCA debe exponerse en el frontend.

### FRONTEND_URL

La URL base de tu aplicación frontend, usada para construir las URLs de retorno después del pago.

**Desarrollo:**
```bash
FRONTEND_URL=http://localhost:5173
```

**Producción:**
```bash
FRONTEND_URL=https://tu-dominio.com
```

### Cómo configurar secretos en Supabase:

#### Opción 1: Usando Supabase CLI

```bash
# Configurar Access Token
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Configurar Frontend URL
supabase secrets set FRONTEND_URL=https://tu-dominio.com
```

#### Opción 2: Usando el Dashboard de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Edge Functions** > **Manage secrets**
3. Agrega los secretos:
   - `MERCADOPAGO_ACCESS_TOKEN`: Tu Access Token de MercadoPago
   - `FRONTEND_URL`: La URL de tu frontend

### Cómo obtener el Access Token:

1. Ingresa a tu cuenta de MercadoPago
2. Ve a **Tus integraciones** > **Credenciales**
3. Selecciona el modo (Prueba o Producción)
4. Copia el **Access Token**

## Cambio de Credenciales de Prueba a Producción

### Paso 1: Obtener Credenciales de Producción

1. Completa el proceso de certificación en MercadoPago
2. Activa tu cuenta para recibir pagos reales
3. Obtén tus credenciales de producción (Public Key y Access Token)

### Paso 2: Actualizar Variables de Entorno

1. **Frontend:** Actualiza `VITE_MERCADOPAGO_PUBLIC_KEY` con la Public Key de producción
2. **Supabase:** Actualiza el secreto `MERCADOPAGO_ACCESS_TOKEN` con el Access Token de producción
3. **Supabase:** Actualiza el secreto `FRONTEND_URL` con tu dominio de producción

### Paso 3: Verificar Configuración

1. Realiza una compra de prueba en producción con una tarjeta real
2. Verifica que el pago se procese correctamente
3. Confirma que los webhooks se reciban y procesen
4. Verifica que el inventario se actualice correctamente

## Modo de Prueba vs Producción

### Identificación del Modo

El sistema detecta automáticamente si está en modo de prueba verificando si el Access Token comienza con `TEST-`.

- **Modo Prueba:** Access Token comienza con `TEST-`
- **Modo Producción:** Access Token comienza con `APP_USR-`

### Indicador Visual

Cuando el sistema está en modo de prueba, se muestra un banner en la interfaz indicando que se están usando credenciales de prueba.

### Tarjetas de Prueba

En modo de prueba, puedes usar las [tarjetas de prueba de MercadoPago](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards) para simular diferentes escenarios:

- **Pago aprobado:** 5031 7557 3453 0604
- **Pago rechazado:** 5031 4332 1540 6351
- **Fondos insuficientes:** 5031 7557 3453 0604 (monto > 1000)

## Webhooks de MercadoPago

### Configuración de Webhooks

1. Ve a **Tus integraciones** > **Webhooks** en MercadoPago
2. Agrega una nueva URL de webhook:
   ```
   https://[tu-proyecto].supabase.co/functions/v1/mercadopago-webhook
   ```
3. Selecciona los eventos a recibir:
   - `payment.created`
   - `payment.updated`

### Verificación de Webhooks

Los webhooks de MercadoPago incluyen una firma HMAC-SHA256 en el header `x-signature` que el sistema valida automáticamente para garantizar la autenticidad.

## Troubleshooting

### Error: "Credenciales no configuradas"

- Verifica que `VITE_MERCADOPAGO_PUBLIC_KEY` esté configurada en el frontend
- Verifica que `MERCADOPAGO_ACCESS_TOKEN` esté configurado en Supabase

### Error: "Invalid signature" en webhooks

- Verifica que el Access Token en Supabase sea correcto
- Confirma que la URL del webhook en MercadoPago sea correcta

### Pagos no se actualizan automáticamente

- Verifica que los webhooks estén configurados en MercadoPago
- Revisa los logs de la Edge Function `mercadopago-webhook`
- Confirma que la URL del webhook sea accesible públicamente

## Seguridad

### Mejores Prácticas

1. **Nunca expongas el Access Token en el frontend**
2. **Usa HTTPS en producción** para todas las comunicaciones
3. **Valida siempre la firma de los webhooks** antes de procesarlos
4. **Mantén las credenciales seguras** y no las incluyas en el control de versiones
5. **Rota las credenciales periódicamente** por seguridad

### Variables de Entorno en Git

Asegúrate de que tu archivo `.env` esté en `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.production
```

## Soporte

Para más información sobre la integración con MercadoPago, consulta:

- [Documentación de Checkout Pro](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/landing)
- [Documentación de Webhooks](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks)
- [Tarjetas de Prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards)
