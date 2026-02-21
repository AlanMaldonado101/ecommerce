-- Migration: Mercado Pago Payment Integration Tables
-- Description: Creates tables for orders, payment transactions, and order status history
-- Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: orders
-- ============================================================================
-- Stores order information including buyer details, items, and payment status
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  items JSONB NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'CLP',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(20),
  preference_id VARCHAR(100),
  buyer_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_status CHECK (
    status IN ('pending', 'paid', 'failed', 'cancelled')
  ),
  CONSTRAINT valid_payment_method CHECK (
    payment_method IN ('checkout_pro', 'checkout_api') OR payment_method IS NULL
  ),
  CONSTRAINT positive_amount CHECK (total_amount > 0),
  CONSTRAINT valid_currency CHECK (currency IN ('CLP'))
);

-- Indexes for orders table
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_preference_id ON orders(preference_id) WHERE preference_id IS NOT NULL;

-- Comment on orders table
COMMENT ON TABLE orders IS 'Stores order information for Mercado Pago payment integration';
COMMENT ON COLUMN orders.order_number IS 'Unique order identifier in format ORD-YYYYMMDD-XXXXX';
COMMENT ON COLUMN orders.items IS 'JSON array of order items with id, title, quantity, unit_price';
COMMENT ON COLUMN orders.buyer_data IS 'JSON object with buyer information (name, email, phone, address)';
COMMENT ON COLUMN orders.preference_id IS 'Mercado Pago preference ID for Checkout Pro';

-- ============================================================================
-- TABLE: payment_transactions
-- ============================================================================
-- Stores payment transaction details from Mercado Pago
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_id VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method_id VARCHAR(50),
  payment_type_id VARCHAR(50),
  status_detail VARCHAR(100),
  response_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_payment_status CHECK (
    status IN ('pending', 'approved', 'rejected', 'cancelled', 'in_process', 'refunded')
  ),
  CONSTRAINT positive_transaction_amount CHECK (amount > 0)
);

-- Indexes for payment_transactions table
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id ON payment_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at DESC);

-- Comment on payment_transactions table
COMMENT ON TABLE payment_transactions IS 'Stores payment transaction details from Mercado Pago API';
COMMENT ON COLUMN payment_transactions.payment_id IS 'Mercado Pago payment ID';
COMMENT ON COLUMN payment_transactions.response_data IS 'Complete JSON response from Mercado Pago API';
COMMENT ON COLUMN payment_transactions.status_detail IS 'Detailed status information from Mercado Pago';

-- ============================================================================
-- TABLE: order_status_history
-- ============================================================================
-- Tracks all status changes for orders (audit trail)
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  changed_by VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_previous_status CHECK (
    previous_status IN ('pending', 'paid', 'failed', 'cancelled') OR previous_status IS NULL
  ),
  CONSTRAINT valid_new_status CHECK (
    new_status IN ('pending', 'paid', 'failed', 'cancelled')
  ),
  CONSTRAINT valid_changed_by CHECK (
    changed_by IN ('system', 'webhook', 'admin', 'user')
  )
);

-- Indexes for order_status_history table
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at DESC);

-- Comment on order_status_history table
COMMENT ON TABLE order_status_history IS 'Audit trail for order status changes';
COMMENT ON COLUMN order_status_history.changed_by IS 'Source of the status change: system, webhook, admin, or user';
COMMENT ON COLUMN order_status_history.metadata IS 'Additional context about the status change (JSON)';

-- ============================================================================
-- TRIGGER: Update updated_at timestamp
-- ============================================================================
-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for payment_transactions table
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRIGGER: Automatic order status history tracking
-- ============================================================================
-- Function to automatically log status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO order_status_history (
      order_id,
      previous_status,
      new_status,
      changed_by,
      metadata
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      'system', -- Default to system, can be overridden by application
      jsonb_build_object(
        'payment_method', NEW.payment_method,
        'total_amount', NEW.total_amount,
        'changed_at', NOW()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic status history logging
DROP TRIGGER IF EXISTS log_order_status_change_trigger ON orders;
CREATE TRIGGER log_order_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- ============================================================================
-- FUNCTION: Generate unique order number
-- ============================================================================
-- Function to generate order numbers in format ORD-YYYYMMDD-XXXXX
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  date_part VARCHAR(8);
  sequence_part VARCHAR(5);
  new_order_number VARCHAR(50);
  max_sequence INTEGER;
BEGIN
  -- Get current date in YYYYMMDD format
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  
  -- Get the maximum sequence number for today
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(order_number FROM 14 FOR 5) AS INTEGER
      )
    ),
    0
  ) INTO max_sequence
  FROM orders
  WHERE order_number LIKE 'ORD-' || date_part || '-%';
  
  -- Increment and format sequence
  sequence_part := LPAD((max_sequence + 1)::TEXT, 5, '0');
  
  -- Construct order number
  new_order_number := 'ORD-' || date_part || '-' || sequence_part;
  
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Comment on function
COMMENT ON FUNCTION generate_order_number() IS 'Generates unique order numbers in format ORD-YYYYMMDD-XXXXX';

-- ============================================================================
-- FUNCTION: Validate order state transition
-- ============================================================================
-- Function to validate state transitions
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
  
  -- cancelled -> pending (allow retry)
  IF OLD.status = 'cancelled' AND NEW.status = 'pending' THEN
    RETURN NEW;
  END IF;
  
  -- failed -> pending (allow retry)
  IF OLD.status = 'failed' AND NEW.status = 'pending' THEN
    RETURN NEW;
  END IF;
  
  -- All other transitions are invalid
  RAISE EXCEPTION 'Invalid order status transition from % to %', OLD.status, NEW.status;
END;
$$ LANGUAGE plpgsql;

-- Trigger for state transition validation
DROP TRIGGER IF EXISTS validate_order_state_transition_trigger ON orders;
CREATE TRIGGER validate_order_state_transition_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION validate_order_state_transition();

-- Comment on function
COMMENT ON FUNCTION validate_order_state_transition() IS 'Validates order status transitions and sets paid_at timestamp';
