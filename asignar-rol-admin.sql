-- ============================================
-- ASIGNAR ROL DE ADMINISTRADOR A UN USUARIO
-- ============================================
-- Este script te permite asignar el rol 'admin' a un usuario
-- 
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard → SQL Editor
-- 2. Reemplaza 'EMAIL_DEL_USUARIO@ejemplo.com' con el email del usuario
-- 3. Ejecuta el script
-- ============================================

-- Opción 1: Asignar rol admin por EMAIL del usuario
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'EMAIL_DEL_USUARIO@ejemplo.com'
);

-- Si el usuario no tiene un registro en user_roles, créalo:
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'EMAIL_DEL_USUARIO@ejemplo.com'
AND NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.users.id
);

-- ============================================
-- VERIFICAR ROLES DE USUARIOS
-- ============================================
-- Para ver todos los usuarios y sus roles:
SELECT 
    u.email,
    ur.role,
    u.created_at as fecha_registro
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;

-- ============================================
-- CAMBIAR ROL DE CUALQUIER USUARIO
-- ============================================
-- Para cambiar el rol de un usuario específico:
-- UPDATE public.user_roles
-- SET role = 'admin'  -- o 'customer'
-- WHERE user_id = 'UUID_DEL_USUARIO';

-- ============================================
-- ELIMINAR ROL ADMIN (volver a customer)
-- ============================================
-- UPDATE public.user_roles
-- SET role = 'customer'
-- WHERE user_id = (
--     SELECT id FROM auth.users 
--     WHERE email = 'EMAIL_DEL_USUARIO@ejemplo.com'
-- );
