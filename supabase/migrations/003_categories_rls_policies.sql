-- Si ya creaste la tabla categories y obtienes 403 al crear categorías,
-- ejecuta esto en Supabase SQL Editor para añadir las políticas RLS:

-- Habilitar RLS (por si acaso)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay (para poder recrear)
DROP POLICY IF EXISTS "Allow public read categories" ON categories;
DROP POLICY IF EXISTS "Allow admin insert categories" ON categories;
DROP POLICY IF EXISTS "Allow admin update categories" ON categories;
DROP POLICY IF EXISTS "Allow admin delete categories" ON categories;

-- Política: todos pueden leer categorías
CREATE POLICY "Allow public read categories"
  ON categories FOR SELECT
  TO public
  USING (true);

-- Política: solo admins pueden crear categorías
CREATE POLICY "Allow admin insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Política: solo admins pueden actualizar categorías
CREATE POLICY "Allow admin update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Política: solo admins pueden eliminar categorías
CREATE POLICY "Allow admin delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
