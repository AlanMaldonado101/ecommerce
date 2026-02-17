# Instrucciones: Base de datos para Cotillón

## Cambios necesarios en Supabase

Para que el Dashboard de productos funcione correctamente adaptado a cotillón (con categorías dinámicas y precios por menor/mayor), debes ejecutar las migraciones en Supabase.

### 1. Ir al SQL Editor
En tu proyecto de Supabase: **Dashboard > SQL Editor > New Query**

### 2. Migración 1 - Products y Variants (ejecutar primero)

```sql
-- Renombrar 'brand' a 'category' en products
ALTER TABLE products RENAME COLUMN brand TO category;

-- Añadir precio por mayor en variants
ALTER TABLE variants ADD COLUMN IF NOT EXISTS price_wholesale NUMERIC DEFAULT 0;

-- (Opcional) Si ya tienes productos, copiar el precio actual como precio por mayor inicial
UPDATE variants SET price_wholesale = price WHERE price_wholesale = 0 OR price_wholesale IS NULL;
```

### 3. Migración 2 - Tabla de categorías (ejecutar después)

```sql
-- Crear tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Habilitar RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Políticas: todos leen, solo admins crean/editan/eliminan
CREATE POLICY "Allow public read categories" ON categories FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin insert categories" ON categories FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow admin update categories" ON categories FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow admin delete categories" ON categories FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Insertar categorías iniciales
INSERT INTO categories (name, slug) VALUES
  ('Globos', 'globos'),
  ('Decoración', 'decoracion'),
  ('Velas', 'velas'),
  ('Cotillón', 'cotillon'),
  ('Confeti', 'confeti'),
  ('Vajilla', 'vajilla'),
  ('Gorros de fiesta', 'gorros'),
  ('Piñatas', 'piñatas'),
  ('Otros', 'otros')
ON CONFLICT (slug) DO NOTHING;
```

### 4. Verificar

Después de ejecutar:
- La tabla `products` tendrá la columna `category` (slug de la categoría)
- La tabla `variants` tendrá la columna `price_wholesale`
- La tabla `categories` contendrá las categorías disponibles

### 4. (Importante) Si obtienes 403 al crear categorías

Si al pulsar "Crear" en una nueva categoría aparece **403 Forbidden**, falta ejecutar las políticas RLS. Ejecuta el archivo `supabase/migrations/003_categories_rls_policies.sql` en el SQL Editor.

**Importante:** Debes estar logueado como **admin** para crear categorías. Verifica en la tabla `user_roles` que tu usuario tenga `role = 'admin'`.

### Crear categorías nuevas

Desde el formulario de **Añadir producto** en el Dashboard, puedes crear nuevas categorías con el botón **"+ Nueva"**: escribe el nombre y pulsa Crear.
