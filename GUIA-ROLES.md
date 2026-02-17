# 🔐 Guía para Asignar Roles de Administrador

## 📋 Opciones para Asignar Roles

Tienes **3 formas** de asignar el rol de administrador a un usuario:

---

## ✅ Opción 1: Desde Supabase Dashboard (Más Fácil)

### Paso 1: Encontrar el ID del Usuario
1. Ve a **Supabase Dashboard** → tu proyecto
2. Ve a **Authentication** → **Users**
3. Busca el usuario al que quieres darle rol de admin
4. Copia su **User UID** (es un UUID largo)

### Paso 2: Actualizar el Rol en la Tabla
1. Ve a **Table Editor** → `user_roles`
2. Busca la fila donde `user_id` coincida con el UUID que copiaste
3. Haz clic en el campo `role` y cámbialo de `customer` a `admin`
4. Guarda los cambios

**¡Listo!** El usuario ahora tiene acceso al dashboard.

---

## ✅ Opción 2: Usando SQL (Rápido para Múltiples Usuarios)

### Paso 1: Ejecutar Script SQL
1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Abre el archivo `asignar-rol-admin.sql` que está en la raíz del proyecto
3. Reemplaza `'EMAIL_DEL_USUARIO@ejemplo.com'` con el email real del usuario
4. Ejecuta el script

**Ejemplo:**
```sql
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'admin@tudominio.com'
);
```

---

## ✅ Opción 3: Ver Todos los Usuarios y Sus Roles

Ejecuta este query en el SQL Editor para ver todos los usuarios:

```sql
SELECT 
    u.email,
    ur.role,
    u.created_at as fecha_registro
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;
```

---

## 🔒 Cómo Funciona la Protección

El sistema ya está configurado para:

1. **Proteger el Dashboard**: Solo usuarios con rol `admin` pueden acceder a `/dashboard/*`
2. **Mostrar enlace**: El enlace "Dashboard" solo aparece en el menú si el usuario es admin
3. **Redirigir automáticamente**: Si un usuario sin rol admin intenta acceder, es redirigido a la página principal

---

## 📝 Roles Disponibles

- **`customer`**: Rol por defecto para usuarios normales
- **`admin`**: Rol de administrador con acceso al dashboard

---

## ⚠️ Notas Importantes

- Si un usuario no tiene registro en `user_roles`, el sistema puede fallar. Asegúrate de que todos los usuarios tengan un rol asignado.
- Para cambiar un admin de vuelta a customer, simplemente cambia el `role` de `admin` a `customer` en la tabla `user_roles`.
