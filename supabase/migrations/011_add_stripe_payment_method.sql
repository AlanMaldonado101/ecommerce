-- Migration: Add 'stripe' as valid payment method
-- Updates the valid_payment_method CHECK constraint on the orders table

ALTER TABLE orders
DROP CONSTRAINT IF EXISTS valid_payment_method;

ALTER TABLE orders
ADD CONSTRAINT valid_payment_method CHECK (
  payment_method IN ('checkout_pro', 'checkout_api', 'stripe') OR payment_method IS NULL
);

COMMENT ON COLUMN orders.payment_method IS 'Payment method used: checkout_pro (MP), checkout_api (MP direct), or stripe';
