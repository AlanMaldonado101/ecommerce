-- ============================================
-- POLÍTICAS RLS PARA user_roles y customers
-- ============================================
-- Este script configura las políticas de seguridad necesarias
-- para que los usuarios puedan insertar sus propios datos
-- 
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard → SQL Editor
-- 2. Pega este código completo
-- 3. Ejecuta el script
-- ============================================

-- ============================================
-- POLÍTICAS PARA LA TABLA user_roles
-- ============================================

-- Habilitar RLS en la tabla user_roles (si no está habilitado)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay (opcional, comenta si quieres mantenerlas)
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

-- Política para INSERT: Los usuarios autenticados pueden insertar su propio rol
CREATE POLICY "Users can insert their own role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política para SELECT: Los usuarios pueden ver su propio rol
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política para UPDATE: Los usuarios pueden actualizar su propio rol (opcional)
CREATE POLICY "Users can update their own role"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS PARA LA TABLA customers
-- ============================================

-- Habilitar RLS en la tabla customers (si no está habilitado)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay (opcional, comenta si quieres mantenerlas)
DROP POLICY IF EXISTS "Users can insert their own customer data" ON public.customers;
DROP POLICY IF EXISTS "Users can view their own customer data" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customer data" ON public.customers;

-- Política para INSERT: Los usuarios autenticados pueden insertar sus propios datos
CREATE POLICY "Users can insert their own customer data"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política para SELECT: Los usuarios pueden ver sus propios datos
CREATE POLICY "Users can view their own customer data"
ON public.customers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política para UPDATE: Los usuarios pueden actualizar sus propios datos
CREATE POLICY "Users can update their own customer data"
ON public.customers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Después de ejecutar este script, puedes verificar las políticas con:
-- SELECT * FROM pg_policies WHERE tablename IN ('user_roles', 'customers');
-- ============================================
