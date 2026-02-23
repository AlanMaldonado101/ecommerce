# Migration 008: Orders Table Updates

## Overview
This migration updates the `orders` table to support the complete Mercado Pago checkout integration workflow, adding missing fields and expanding status options to include fulfillment states.

## Changes

### New Columns
1. **payment_id** (TEXT)
   - Stores the Mercado Pago payment ID from approved payments
   - Used to link orders with payment transactions
   - Indexed for fast webhook lookups
   - Nullable (only set after payment approval)

2. **stock_updated** (BOOLEAN)
   - Tracks whether inventory has been updated for this order
   - Default: `FALSE`
   - Ensures idempotency (stock reduced only once even with multiple webhooks)
   - Not nullable

### Updated Status Constraint
The `status` field now accepts these values:
- `pending` - Order created, awaiting payment
- `paid` - Payment approved
- `processing` - Order being prepared
- `shipped` - Order sent to customer
- `delivered` - Order received by customer
- `cancelled` - Order cancelled
- `failed` - Payment failed (kept for backward compatibility)

### New Indexes
- `idx_orders_payment_id` - Partial index on payment_id (WHERE payment_id IS NOT NULL)

### Updated Functions
- `validate_order_state_transition()` - Now includes transitions for fulfillment states:
  - paid → processing
  - processing → shipped
  - shipped → delivered
  - paid/processing/shipped → cancelled

## Requirements Validated
- 4.2: Order has unique ID (UUID)
- 4.3: Order has unique order_number
- 4.4: Order stores preference_id
- 4.5: Order has initial status "pending"
- 4.6: Order stores items as JSONB
- 4.7: Order stores buyer_data as JSONB
- 4.8: Order stores buyer_id
- 4.9: Order stores total_amount

## Backward Compatibility
- All changes are additive (new columns, expanded constraints)
- Existing data remains valid
- Default values ensure existing rows work without modification
- The 'failed' status is retained for backward compatibility

## Testing
After applying this migration:
1. Verify new columns exist: `\d orders`
2. Check indexes: `\di idx_orders_payment_id`
3. Test status transitions work correctly
4. Verify stock_updated defaults to FALSE for new orders

## Rollback
To rollback this migration:
```sql
-- Remove new columns
ALTER TABLE orders DROP COLUMN IF EXISTS payment_id;
ALTER TABLE orders DROP COLUMN IF EXISTS stock_updated;

-- Restore original status constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE orders ADD CONSTRAINT valid_status CHECK (
  status IN ('pending', 'paid', 'failed', 'cancelled')
);

-- Drop new index
DROP INDEX IF EXISTS idx_orders_payment_id;
```
