-- Tabla de categorías para cotillón
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Habilitar RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Política: todos pueden leer categorías (filtros, formularios)
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

-- Insertar categorías iniciales
INSERT INTO categories (name, slug) VALUES
  ('Globos', 'globos'),
  ('Decoración', 'decoracion'),
  ('Velas', 'velas'),
  ('Cotillón', 'cotillon'),
  ('Confeti', 'confeti'),
  ('Vajilla', 'vajilla'),
  ('Gorros de fiesta', 'gorros'),
  ('Piñatas', 'pinatas'),
  ('Otros', 'otros')
ON CONFLICT (slug) DO NOTHING;
