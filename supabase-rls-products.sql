-- ============================================
-- POLÍTICAS RLS PARA products y variants
-- ============================================
-- Este script configura las políticas de seguridad necesarias
-- para que los usuarios puedan leer productos y variantes
-- 
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard → SQL Editor
-- 2. Pega este código completo
-- 3. Ejecuta el script
-- ============================================

-- ============================================
-- POLÍTICAS PARA LA TABLA products
-- ============================================

-- Habilitar RLS en la tabla products (si no está habilitado)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay (opcional, comenta si quieres mantenerlas)
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

-- Política para SELECT: Todos pueden ver productos (público)
CREATE POLICY "Products are viewable by everyone"
ON public.products
FOR SELECT
TO public
USING (true);

-- Política para INSERT: Solo admins pueden crear productos
CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- Política para UPDATE: Solo admins pueden actualizar productos
CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- Política para DELETE: Solo admins pueden eliminar productos
CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- ============================================
-- POLÍTICAS PARA LA TABLA variants
-- ============================================

-- Habilitar RLS en la tabla variants (si no está habilitado)
ALTER TABLE public.variants ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay (opcional, comenta si quieres mantenerlas)
DROP POLICY IF EXISTS "Variants are viewable by everyone" ON public.variants;
DROP POLICY IF EXISTS "Admins can insert variants" ON public.variants;
DROP POLICY IF EXISTS "Admins can update variants" ON public.variants;
DROP POLICY IF EXISTS "Admins can delete variants" ON public.variants;

-- Política para SELECT: Todos pueden ver variantes (público)
CREATE POLICY "Variants are viewable by everyone"
ON public.variants
FOR SELECT
TO public
USING (true);

-- Política para INSERT: Solo admins pueden crear variantes
CREATE POLICY "Admins can insert variants"
ON public.variants
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- Política para UPDATE: Solo admins pueden actualizar variantes
CREATE POLICY "Admins can update variants"
ON public.variants
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- Política para DELETE: Solo admins pueden eliminar variantes
CREATE POLICY "Admins can delete variants"
ON public.variants
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Después de ejecutar este script, puedes verificar las políticas con:
-- SELECT * FROM pg_policies WHERE tablename IN ('products', 'variants');
-- ============================================
