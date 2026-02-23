-- ============================================
-- MIGRACIÓN: Componentes de Arreglos Personalizados
-- ============================================
-- Extiende la tabla products para soportar componentes
-- del sistema "Arma tu Arreglo"
-- ============================================

-- 0. CREAR CATEGORÍA PARA COMPONENTES DE ARREGLO
-- Insertar la categoría especial para componentes de arreglo
INSERT INTO public.categories (name, slug) 
VALUES ('Componente de Arreglo', 'componente-arreglo')
ON CONFLICT (slug) DO NOTHING;

-- 1. AGREGAR CAMPOS PARA COMPONENTES DE ARREGLO
-- Campo para categoría de componente (BASE, FLORES, GLOBOS, EXTRAS)
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS component_category TEXT 
  CHECK (component_category IN ('BASE', 'FLORES', 'GLOBOS', 'EXTRAS'));

-- Campo para orden de visualización de componentes
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS component_order INTEGER DEFAULT 0;

-- 2. CREAR ÍNDICE PARA OPTIMIZAR CONSULTAS DE COMPONENTES
-- Índice para filtrar componentes por categoría
CREATE INDEX IF NOT EXISTS idx_products_component_category 
  ON public.products(component_category) 
  WHERE category = 'componente-arreglo';

-- 3. COMENTARIOS PARA DOCUMENTACIÓN
COMMENT ON COLUMN public.products.component_category IS 
  'Categoría del componente para el constructor de arreglos: BASE, FLORES, GLOBOS, EXTRAS. NULL para productos regulares.';

COMMENT ON COLUMN public.products.component_order IS 
  'Orden de visualización del componente en el selector. Menor número = mayor prioridad.';

COMMENT ON INDEX idx_products_component_category IS 
  'Optimiza consultas de componentes por categoría para el sistema "Arma tu Arreglo".';
