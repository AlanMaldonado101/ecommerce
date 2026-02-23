# Migration 010: Orders Admin Update Policy

## Descripción

Esta migración agrega una política RLS que permite a los usuarios administradores actualizar órdenes. Esto es necesario para la gestión de cumplimiento de órdenes (fulfillment), permitiendo a los admins cambiar el estado de las órdenes a través del ciclo de vida: paid → processing → shipped → delivered.

## Cambios Realizados

### Políticas RLS Modificadas

1. **Eliminada**: `"Users cannot update orders"` - Política restrictiva que impedía todas las actualizaciones
2. **Agregada**: `"Admins can update orders"` - Permite a usuarios con rol 'admin' actualizar órdenes

### Políticas RLS Completas para `orders`

Después de esta migración, las políticas RLS para la tabla `orders` son:

| Operación | Política | Descripción |
|-----------|----------|-------------|
| SELECT | Users can view their own orders | Usuarios ven solo sus propias órdenes (buyer_id = auth.uid()) |
| INSERT | Users can create orders for themselves | Usuarios crean órdenes solo para sí mismos (buyer_id = auth.uid()) |
| UPDATE | Admins can update orders | Solo admins pueden actualizar órdenes (role = 'admin') |
| DELETE | Users cannot delete orders | Nadie puede eliminar órdenes (excepto service_role) |
| ALL | Service role can do everything | Edge Functions con service_role tienen acceso completo |

## Requisitos Validados

- **Requisito 9.4**: Usuarios pueden ver solo sus propias órdenes usando RLS
- **Requisito 12.4**: Solo admins pueden actualizar órdenes

## Dependencias

### Tabla `user_roles` Requerida

Esta migración asume que existe una tabla `user_roles` con la siguiente estructura:

```sql
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('admin', 'customer')),
  PRIMARY KEY (user_id)
);
```

Si la tabla no existe, la política no funcionará correctamente. Verifica que la tabla `user_roles` esté creada antes de aplicar esta migración.

## Casos de Uso

### Admins Actualizando Órdenes

Los usuarios con rol 'admin' pueden actualizar el estado de las órdenes para gestionar el fulfillment:

```sql
-- Admin actualiza orden a "processing"
UPDATE orders 
SET status = 'processing' 
WHERE id = 'order-uuid';

-- Admin actualiza orden a "shipped"
UPDATE orders 
SET status = 'shipped' 
WHERE id = 'order-uuid';
```

### Usuarios Regulares

Los usuarios regulares (sin rol admin) **no pueden** actualizar órdenes:

```sql
-- Esto fallará con error de RLS
UPDATE orders 
SET status = 'cancelled' 
WHERE id = 'order-uuid' AND buyer_id = auth.uid();
```

### Edge Functions (Service Role)

Las Edge Functions usando el service_role key mantienen acceso completo para procesamiento de webhooks:

```typescript
// Webhook actualiza orden después de pago aprobado
await supabase
  .from('orders')
  .update({ 
    status: 'paid', 
    paid_at: new Date().toISOString(),
    payment_id: paymentId 
  })
  .eq('id', orderId);
```

## Testing

### Verificar Política de Admin

```sql
-- Como admin (asume que el usuario actual tiene rol 'admin')
UPDATE orders SET status = 'processing' WHERE id = 'test-order-id';
-- Debe ejecutarse exitosamente

-- Como usuario regular (sin rol admin)
UPDATE orders SET status = 'processing' WHERE id = 'test-order-id';
-- Debe fallar con error de RLS
```

### Verificar Políticas Existentes

```sql
-- SELECT: Usuario ve solo sus órdenes
SELECT * FROM orders;
-- Debe retornar solo órdenes donde buyer_id = auth.uid()

-- INSERT: Usuario crea orden para sí mismo
INSERT INTO orders (buyer_id, ...) VALUES (auth.uid(), ...);
-- Debe ejecutarse exitosamente

INSERT INTO orders (buyer_id, ...) VALUES ('otro-user-id', ...);
-- Debe fallar con error de RLS
```

## Rollback

Si necesitas revertir esta migración:

```sql
-- Eliminar política de admin
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- Restaurar política restrictiva original
CREATE POLICY "Users cannot update orders"
  ON orders
  FOR UPDATE
  USING (false);
```

## Notas Importantes

1. **Service Role**: Las Edge Functions usando service_role key mantienen acceso completo y no se ven afectadas por esta política
2. **Transiciones de Estado**: La función `validate_order_state_transition()` sigue validando las transiciones de estado permitidas
3. **Auditoría**: Los cambios de estado se registran automáticamente en `order_status_history` mediante triggers
4. **Seguridad**: Los usuarios regulares no pueden modificar sus propias órdenes, solo los admins y el sistema (via webhooks)

## Referencias

- Migración 006: Políticas RLS originales para orders
- Migración 008: Actualización de tabla orders con campos adicionales
- Design Document: Sección "Row Level Security (RLS)"
- Requirements: 9.4, 12.4
