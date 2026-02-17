-- ============================================
-- POLÍTICAS RLS PARA andresses y orders
-- ============================================
-- Soluciona "new row violates row-level security policy for table andresses"
-- y permite que el checkout (crear dirección + pedido) funcione.
--
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard → SQL Editor
-- 2. Pega este código completo
-- 3. Ejecuta el script
-- ============================================

-- ============================================
-- POLÍTICAS PARA LA TABLA andresses
-- ============================================

ALTER TABLE public.andresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own address" ON public.andresses;
DROP POLICY IF EXISTS "Users can view own addresses" ON public.andresses;
DROP POLICY IF EXISTS "Admins can view all addresses" ON public.andresses;

-- INSERT: el usuario solo puede insertar una dirección con su propio customer_od
CREATE POLICY "Users can insert own address"
ON public.andresses
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.customers
    WHERE customers.id = customer_od
    AND customers.user_id = auth.uid()
  )
);

-- SELECT: ver solo direcciones propias (customer_od = mi customer id)
CREATE POLICY "Users can view own addresses"
ON public.andresses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.customers
    WHERE customers.id = customer_od
    AND customers.user_id = auth.uid()
  )
);

-- SELECT: admins pueden ver todas las direcciones (para ver detalle de pedidos)
CREATE POLICY "Admins can view all addresses"
ON public.andresses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- ============================================
-- POLÍTICAS PARA LA TABLA orders
-- ============================================

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own order" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

-- INSERT: el usuario solo puede crear pedidos con su customers_id
CREATE POLICY "Users can insert own order"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.customers
    WHERE customers.id = customers_id
    AND customers.user_id = auth.uid()
  )
);

-- SELECT: ver solo mis pedidos
CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.customers
    WHERE customers.id = customers_id
    AND customers.user_id = auth.uid()
  )
);

-- SELECT: admins pueden ver todos los pedidos
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- UPDATE: solo admins pueden cambiar estado del pedido
CREATE POLICY "Admins can update orders"
ON public.orders
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

-- ============================================
-- POLÍTICAS PARA LA TABLA order_items
-- ============================================

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

-- INSERT: solo se pueden añadir ítems a pedidos que son del usuario
CREATE POLICY "Users can insert own order items"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.customers c ON c.id = o.customers_id
    WHERE o.id = order_id
    AND c.user_id = auth.uid()
  )
);

-- SELECT: ver ítems de mis pedidos
CREATE POLICY "Users can view own order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.customers c ON c.id = o.customers_id
    WHERE o.id = order_id
    AND c.user_id = auth.uid()
  )
);

-- SELECT: admins pueden ver todos los ítems
CREATE POLICY "Admins can view all order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);
