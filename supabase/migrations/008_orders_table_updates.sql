-- Migration: Update orders table for complete checkout integration
-- Description: Adds missing fields (payment_id, stock_updated) and updates status constraint
-- Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9

-- ============================================================================
-- Add missing columns to orders table
-- ============================================================================

-- Add payment_id column to store Mercado Pago payment ID
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- Add stock_updated column to track inventory updates (for idempotency)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS stock_updated BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================================
-- Update status constraint to include all valid statuses
-- ============================================================================

-- Drop existing constraint
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS valid_status;

-- Add updated constraint with all valid statuses
ALTER TABLE orders 
ADD CONSTRAINT valid_status CHECK (
  status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'failed')
);

-- ============================================================================
-- Create indexes for new columns
-- ============================================================================

-- Index for payment_id (for webhook lookups)
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id) WHERE payment_id IS NOT NULL;

-- ============================================================================
-- Update comments
-- ============================================================================

COMMENT ON COLUMN orders.payment_id IS 'Mercado Pago payment ID from approved payment';
COMMENT ON COLUMN orders.stock_updated IS 'Flag to ensure stock is updated only once (idempotency)';

-- ============================================================================
-- Update state transition validation function
-- ============================================================================

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS validate_order_state_transition_trigger ON orders;
DROP FUNCTION IF EXISTS validate_order_state_transition();

-- Recreate function with updated valid transitions
CREATE OR REPLACE FUNCTION validate_order_state_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow any transition for new records
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;
  
  -- If status hasn't changed, allow update
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Define valid transitions
  -- pending -> paid, failed, cancelled
  IF OLD.status = 'pending' AND NEW.status IN ('paid', 'failed', 'cancelled') THEN
    -- If transitioning to paid, set paid_at timestamp
    IF NEW.status = 'paid' AND NEW.paid_at IS NULL THEN
      NEW.paid_at := NOW();
    END IF;
    RETURN NEW;
  END IF;
  
  -- paid -> processing (order being prepared)
  IF OLD.status = 'paid' AND NEW.status = 'processing' THEN
    RETURN NEW;
  END IF;
  
  -- processing -> shipped (order sent)
  IF OLD.status = 'processing' AND NEW.status = 'shipped' THEN
    RETURN NEW;
  END IF;
  
  -- shipped -> delivered (order received)
  IF OLD.status = 'shipped' AND NEW.status = 'delivered' THEN
    RETURN NEW;
  END IF;
  
  -- cancelled -> pending (allow retry)
  IF OLD.status = 'cancelled' AND NEW.status = 'pending' THEN
    RETURN NEW;
  END IF;
  
  -- failed -> pending (allow retry)
  IF OLD.status = 'failed' AND NEW.status = 'pending' THEN
    RETURN NEW;
  END IF;
  
  -- paid/processing/shipped -> cancelled (allow cancellation)
  IF OLD.status IN ('paid', 'processing', 'shipped') AND NEW.status = 'cancelled' THEN
    RETURN NEW;
  END IF;
  
  -- All other transitions are invalid
  RAISE EXCEPTION 'Invalid order status transition from % to %', OLD.status, NEW.status;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER validate_order_state_transition_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION validate_order_state_transition();

COMMENT ON FUNCTION validate_order_state_transition() IS 'Validates order status transitions including fulfillment states';

-- ============================================================================
-- Update order_status_history constraint
-- ============================================================================

-- Drop existing constraints
ALTER TABLE order_status_history 
DROP CONSTRAINT IF EXISTS valid_previous_status;

ALTER TABLE order_status_history 
DROP CONSTRAINT IF EXISTS valid_new_status;

-- Add updated constraints
ALTER TABLE order_status_history 
ADD CONSTRAINT valid_previous_status CHECK (
  previous_status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'failed') 
  OR previous_status IS NULL
);

ALTER TABLE order_status_history 
ADD CONSTRAINT valid_new_status CHECK (
  new_status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'failed')
);
