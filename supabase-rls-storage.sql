-- ============================================
-- POLÍTICAS RLS PARA STORAGE (bucket product-images)
-- ============================================
-- El error "new row violates row-level security policy" al subir imágenes
-- se soluciona permitiendo a los admins insertar en storage.objects.
--
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard → SQL Editor
-- 2. Pega este código completo
-- 3. Ejecuta el script
-- ============================================

-- Eliminar políticas existentes del bucket product-images (si las hay)
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;

-- SELECT: Cualquiera puede ver las imágenes de productos (público)
CREATE POLICY "Anyone can view product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- INSERT: Solo admins pueden subir imágenes
CREATE POLICY "Admins can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- UPDATE: Solo admins pueden actualizar archivos del bucket
CREATE POLICY "Admins can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (bucket_id = 'product-images');

-- DELETE: Solo admins pueden eliminar archivos del bucket
CREATE POLICY "Admins can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- ============================================
-- NOTA: Si el bucket "product-images" no existe,
-- créalo en Dashboard → Storage → New bucket.
-- Nombre: product-images | Public: sí (para que las URLs de imágenes funcionen).
-- ============================================
