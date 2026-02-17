-- ============================================
-- CLAVES FORÁNEAS PARA LA TABLA orders
-- ============================================
-- El error "Could not find a relationship between 'orders' and 'customers'"
-- ocurre porque PostgREST/Supabase necesita FKs definidas para hacer los JOINs.
--
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard → SQL Editor
-- 2. Pega y ejecuta este script
-- ============================================

-- Relación orders -> customers (para poder hacer .select('*, customers(...)'))
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_customers_id_fkey;

ALTER TABLE public.orders
ADD CONSTRAINT orders_customers_id_fkey
FOREIGN KEY (customers_id) REFERENCES public.customers(id);

-- Relación orders -> addresses (solo si al ver el detalle de un pedido falla por "addresses")
-- Descomenta y usa la opción que coincida con el nombre de tu tabla de direcciones.
-- ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_adress_id_fkey;
-- Si la tabla se llama "addresses":
-- ALTER TABLE public.orders ADD CONSTRAINT orders_adress_id_fkey
--   FOREIGN KEY (adress_id) REFERENCES public.addresses(id);
-- Si la tabla se llama "andresses":
-- ALTER TABLE public.orders ADD CONSTRAINT orders_adress_id_fkey
--   FOREIGN KEY (adress_id) REFERENCES public.andresses(id);
