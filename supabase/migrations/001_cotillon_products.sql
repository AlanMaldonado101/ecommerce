-- Migración para adaptar productos a cotillón
-- Ejecutar en Supabase SQL Editor: Dashboard > SQL Editor > New Query

-- 1. Renombrar 'brand' a 'category' en products
ALTER TABLE products RENAME COLUMN brand TO category;

-- 2. Añadir precio por mayor en variants
ALTER TABLE variants ADD COLUMN IF NOT EXISTS price_wholesale NUMERIC DEFAULT 0;

-- 3. Si price_wholesale es 0 y ya tienes datos, copiar price como price_wholesale inicial
-- UPDATE variants SET price_wholesale = price WHERE price_wholesale = 0;
