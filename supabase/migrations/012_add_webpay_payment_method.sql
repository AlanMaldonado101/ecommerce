-- Migration: Allow 'webpay' as a valid payment method
-- Description: Updates the valid_payment_method constraint
-- Requirements: Webpay integration

-- Drop existing constraint on orders table
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS valid_payment_method;

-- Add updated constraint
ALTER TABLE orders 
ADD CONSTRAINT valid_payment_method CHECK (
  payment_method IN ('checkout_pro', 'checkout_api', 'stripe', 'webpay') OR payment_method IS NULL
);

-- Note: The orders table structure is already well-designed with UUID, JSON items, status, payment_id and stock_updated.
