-- ============================================
-- MIGRACIÓN: Nuevos campos para productos
-- ============================================
-- 1. Tablas auxiliares: subcategories, providers, occasions
-- 2. Modificación tabla products: subcategory_id, provider_id, tags
-- 3. Tabla pivot: product_occasions
-- ============================================

-- 1. TABLA SUBCATEGORIES
CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE, -- Relación con categoría padre (opcional si es estricta)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Subcategories
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subcategories viewable by everyone" ON public.subcategories FOR SELECT TO public USING (true);
CREATE POLICY "Admins insert subcategories" ON public.subcategories FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins update subcategories" ON public.subcategories FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins delete subcategories" ON public.subcategories FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));


-- 2. TABLA PROVIDERS
CREATE TABLE IF NOT EXISTS public.providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    contact_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Providers
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers viewable by admins" ON public.providers FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins insert providers" ON public.providers FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins update providers" ON public.providers FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins delete providers" ON public.providers FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));


-- 3. TABLA OCCASIONS (Temáticas)
CREATE TABLE IF NOT EXISTS public.occasions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Occasions
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Occasions viewable by everyone" ON public.occasions FOR SELECT TO public USING (true);
CREATE POLICY "Admins insert occasions" ON public.occasions FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins update occasions" ON public.occasions FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins delete occasions" ON public.occasions FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));


-- 4. MODIFICAR TABLA PRODUCTS
-- Añadir campos
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES public.providers(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags TEXT[]; -- Array de strings para tags/SEO


-- 5. TABLA PIVOT PRODUCT_OCCASIONS
CREATE TABLE IF NOT EXISTS public.product_occasions (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    occasion_id UUID REFERENCES public.occasions(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, occasion_id)
);

-- RLS Product Occasions
ALTER TABLE public.product_occasions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product Occasions viewable by everyone" ON public.product_occasions FOR SELECT TO public USING (true);
CREATE POLICY "Admins insert product_occasions" ON public.product_occasions FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins delete product_occasions" ON public.product_occasions FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Datos iniciales de ejemplo (Opcional)
-- INSERT INTO public.occasions (name, slug) VALUES ('Cumpleaños', 'cumpleanos'), ('Boda', 'boda'), ('Baby Shower', 'baby-shower') ON CONFLICT DO NOTHING;
