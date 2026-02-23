-- Migration: Add admin UPDATE policy for orders table
-- Description: Allows admin users to update orders for fulfillment management
-- Requirements: 9.4, 12.4
-- Task: 2.3 Crear políticas RLS para orders

-- ============================================================================
-- DROP EXISTING RESTRICTIVE UPDATE POLICY
-- ============================================================================

-- Remove the policy that prevents all user updates
DROP POLICY IF EXISTS "Users cannot update orders" ON orders;

-- ============================================================================
-- CREATE ADMIN UPDATE POLICY
-- ============================================================================

-- Policy: Admins can update orders
-- Requirement 12.4: Only admins can update orders (for fulfillment management)
-- This allows admins to update order status (processing, shipped, delivered)
CREATE POLICY "Admins can update orders"
  ON orders
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

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Admins can update orders" ON orders IS 
  'Requirement 12.4: Only admin users can update orders for fulfillment management';

-- ============================================================================
-- NOTES
-- ============================================================================

-- This policy complements the existing RLS policies from migration 006:
-- 1. SELECT: Users can view their own orders (buyer_id = auth.uid())
-- 2. INSERT: Users can create orders for themselves (buyer_id = auth.uid())
-- 3. UPDATE: Admins can update orders (this policy)
-- 4. Service role maintains full access for Edge Functions (webhook processing)
--
-- The user_roles table is expected to exist with structure:
-- - user_id: UUID (references auth.users)
-- - role: TEXT ('admin' or 'customer')
