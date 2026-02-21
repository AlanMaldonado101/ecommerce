-- Migration: Row Level Security Policies for Mercado Pago Tables
-- Description: Implements RLS policies to protect order and payment data
-- Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Enable RLS on payment_transactions table
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on order_status_history table
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES FOR orders TABLE
-- ============================================================================

-- Policy: Users can view their own orders
-- Requirement 15.3: Users should only see orders where they are the buyer
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  USING (auth.uid() = buyer_id);

-- Policy: Users can create orders for themselves
-- Requirement 15.4: Users can only create orders with their own buyer_id
CREATE POLICY "Users can create orders for themselves"
  ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Policy: Users cannot update orders directly
-- Requirement 15.7: Prevent direct modification of orders by users
-- (Updates should only happen through Edge Functions with service_role)
CREATE POLICY "Users cannot update orders"
  ON orders
  FOR UPDATE
  USING (false);

-- Policy: Users cannot delete orders
-- Orders should never be deleted by users, only by admin/system
CREATE POLICY "Users cannot delete orders"
  ON orders
  FOR DELETE
  USING (false);

-- Policy: Service role has full access to orders
-- Requirement 15.6: Edge Functions using service_role key need full access
CREATE POLICY "Service role can do everything on orders"
  ON orders
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- POLICIES FOR payment_transactions TABLE
-- ============================================================================

-- Policy: Users can view transactions of their orders
-- Requirement 15.5: Users can see payment_transactions only for their orders
CREATE POLICY "Users can view transactions of their orders"
  ON payment_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payment_transactions.order_id
      AND orders.buyer_id = auth.uid()
    )
  );

-- Policy: Users cannot insert transactions directly
-- Transactions should only be created by Edge Functions
CREATE POLICY "Users cannot insert transactions"
  ON payment_transactions
  FOR INSERT
  WITH CHECK (false);

-- Policy: Users cannot update transactions
-- Transactions should only be updated by Edge Functions
CREATE POLICY "Users cannot update transactions"
  ON payment_transactions
  FOR UPDATE
  USING (false);

-- Policy: Users cannot delete transactions
-- Transactions should never be deleted by users
CREATE POLICY "Users cannot delete transactions"
  ON payment_transactions
  FOR DELETE
  USING (false);

-- Policy: Service role has full access to payment_transactions
-- Requirement 15.6: Edge Functions need full access for webhook processing
CREATE POLICY "Service role can do everything on payment_transactions"
  ON payment_transactions
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- POLICIES FOR order_status_history TABLE
-- ============================================================================

-- Policy: Users can view history of their orders
-- Users should be able to see the status history of their own orders
CREATE POLICY "Users can view history of their orders"
  ON order_status_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
      AND orders.buyer_id = auth.uid()
    )
  );

-- Policy: Users cannot insert history records
-- History records should only be created by triggers and Edge Functions
CREATE POLICY "Users cannot insert history records"
  ON order_status_history
  FOR INSERT
  WITH CHECK (false);

-- Policy: Users cannot update history records
-- History records are immutable audit logs
CREATE POLICY "Users cannot update history records"
  ON order_status_history
  FOR UPDATE
  USING (false);

-- Policy: Users cannot delete history records
-- History records should never be deleted
CREATE POLICY "Users cannot delete history records"
  ON order_status_history
  FOR DELETE
  USING (false);

-- Policy: Service role has full access to order_status_history
-- Edge Functions need to create and read history records
CREATE POLICY "Service role can do everything on order_status_history"
  ON order_status_history
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can view their own orders" ON orders IS 
  'Requirement 15.3: Users can only view orders where they are the buyer';

COMMENT ON POLICY "Users can create orders for themselves" ON orders IS 
  'Requirement 15.4: Users can only create orders with their own buyer_id';

COMMENT ON POLICY "Service role can do everything on orders" ON orders IS 
  'Requirement 15.6: Edge Functions with service_role have full access';

COMMENT ON POLICY "Users can view transactions of their orders" ON payment_transactions IS 
  'Requirement 15.5: Users can view payment_transactions only of their orders';

COMMENT ON POLICY "Service role can do everything on payment_transactions" ON payment_transactions IS 
  'Requirement 15.6: Edge Functions need full access for webhook processing';
