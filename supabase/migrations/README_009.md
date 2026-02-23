# Migration 009: Payment Transactions Table Verification

## Overview
This migration verifies that the `payment_transactions` table exists with the correct structure for the Mercado Pago checkout integration. The table was originally created in migration 005, and this migration serves as verification and documentation.

## Requirements
- **7.9**: Store payment transaction details including payment_id, status, status_detail, amount, payment_method_id, payment_type_id, and complete response_data
- **15.2**: Maintain complete audit trail of all payment transactions for logging and monitoring

## Changes

### Verification Checks
1. **Table Structure**: Confirms payment_transactions table exists with all required columns
2. **Indexes**: Verifies presence of indexes on order_id, payment_id, and status
3. **Constraints**: Confirms valid_payment_status constraint exists

### Table Structure (from migration 005)
```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  payment_id VARCHAR(100) UNIQUE,
  status VARCHAR(20),
  status_detail VARCHAR(100),
  amount DECIMAL(10, 2),
  payment_method_id VARCHAR(50),
  payment_type_id VARCHAR(50),
  response_data JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Indexes (from migration 005)
- `idx_payment_transactions_order_id`: Fast lookups by order
- `idx_payment_transactions_payment_id`: Fast lookups by Mercado Pago payment ID
- `idx_payment_transactions_status`: Filter transactions by status

### Constraints (from migration 005)
- `valid_payment_status`: Ensures status is one of: 'pending', 'approved', 'rejected', 'cancelled', 'in_process', 'refunded'
- `positive_transaction_amount`: Ensures amount is greater than 0

## Usage

### Insert Payment Transaction
```sql
INSERT INTO payment_transactions (
  order_id,
  payment_id,
  status,
  status_detail,
  amount,
  payment_method_id,
  payment_type_id,
  response_data
) VALUES (
  'order-uuid',
  'mp-payment-id',
  'approved',
  'accredited',
  45000.00,
  'visa',
  'credit_card',
  '{"full": "mercadopago response"}'::jsonb
);
```

### Query Transactions by Order
```sql
SELECT * FROM payment_transactions
WHERE order_id = 'order-uuid'
ORDER BY created_at DESC;
```

### Query Transactions by Status
```sql
SELECT * FROM payment_transactions
WHERE status = 'approved'
ORDER BY created_at DESC;
```

## Notes
- The table was originally created in migration 005_mercadopago_payment_tables.sql
- This migration performs verification only - no structural changes are made
- The `response_data` JSONB column stores the complete Mercado Pago API response for audit purposes
- The `updated_at` column is automatically updated via trigger when records are modified
- All payment transactions are preserved even if the associated order is deleted (CASCADE on foreign key)

## Rollback
No rollback needed as this migration only performs verification checks. The actual table structure remains unchanged.

## Related Migrations
- **005_mercadopago_payment_tables.sql**: Original creation of payment_transactions table
- **006_mercadopago_rls_policies.sql**: RLS policies for payment_transactions
- **008_orders_table_updates.sql**: Updates to orders table for checkout integration
