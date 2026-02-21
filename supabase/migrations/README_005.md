# Migration 005: Mercado Pago Payment Integration Tables

## Overview
This migration creates the database schema for the Mercado Pago payment integration, including tables for orders, payment transactions, and order status history.

## Tables Created

### 1. `orders`
Stores order information including buyer details, items, and payment status.

**Columns:**
- `id` (UUID, PK): Unique order identifier
- `order_number` (VARCHAR, UNIQUE): Human-readable order number (format: ORD-YYYYMMDD-XXXXX)
- `buyer_id` (UUID, FK): Reference to auth.users
- `items` (JSONB): Array of order items with id, title, quantity, unit_price
- `total_amount` (DECIMAL): Total order amount
- `currency` (VARCHAR): Currency code (default: CLP)
- `status` (VARCHAR): Order status (pending, paid, failed, cancelled)
- `payment_method` (VARCHAR): Payment method used (checkout_pro, checkout_api)
- `preference_id` (VARCHAR): Mercado Pago preference ID for Checkout Pro
- `buyer_data` (JSONB): Buyer information (name, email, phone, address)
- `created_at` (TIMESTAMPTZ): Order creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp
- `paid_at` (TIMESTAMPTZ): Payment completion timestamp

**Constraints:**
- Valid status values: pending, paid, failed, cancelled
- Valid payment methods: checkout_pro, checkout_api
- Positive amount check
- Valid currency: CLP

**Indexes:**
- order_number (unique)
- buyer_id
- status
- created_at (descending)
- preference_id (partial index where not null)

### 2. `payment_transactions`
Stores payment transaction details from Mercado Pago.

**Columns:**
- `id` (UUID, PK): Unique transaction identifier
- `order_id` (UUID, FK): Reference to orders table
- `payment_id` (VARCHAR, UNIQUE): Mercado Pago payment ID
- `status` (VARCHAR): Payment status
- `amount` (DECIMAL): Transaction amount
- `payment_method_id` (VARCHAR): Mercado Pago payment method ID
- `payment_type_id` (VARCHAR): Mercado Pago payment type ID
- `status_detail` (VARCHAR): Detailed status information
- `response_data` (JSONB): Complete Mercado Pago API response
- `created_at` (TIMESTAMPTZ): Transaction creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**Constraints:**
- Valid payment status: pending, approved, rejected, cancelled, in_process, refunded
- Positive amount check

**Indexes:**
- order_id
- payment_id (unique)
- status
- created_at (descending)

### 3. `order_status_history`
Tracks all status changes for orders (audit trail).

**Columns:**
- `id` (UUID, PK): Unique history record identifier
- `order_id` (UUID, FK): Reference to orders table
- `previous_status` (VARCHAR): Status before change
- `new_status` (VARCHAR): Status after change
- `changed_by` (VARCHAR): Source of change (system, webhook, admin, user)
- `metadata` (JSONB): Additional context about the change
- `created_at` (TIMESTAMPTZ): Change timestamp

**Constraints:**
- Valid status values for previous and new status
- Valid changed_by values: system, webhook, admin, user

**Indexes:**
- order_id
- created_at (descending)

## Functions Created

### 1. `update_updated_at_column()`
Automatically updates the `updated_at` column on row updates.

**Triggers:**
- `update_orders_updated_at` on orders table
- `update_payment_transactions_updated_at` on payment_transactions table

### 2. `log_order_status_change()`
Automatically logs status changes to the order_status_history table.

**Trigger:**
- `log_order_status_change_trigger` on orders table (AFTER UPDATE)

### 3. `generate_order_number()`
Generates unique order numbers in format ORD-YYYYMMDD-XXXXX.

**Usage:**
```sql
SELECT generate_order_number();
-- Returns: ORD-20240115-00001
```

### 4. `validate_order_state_transition()`
Validates order status transitions and automatically sets `paid_at` timestamp.

**Valid Transitions:**
- pending → paid, failed, cancelled
- cancelled → pending (retry)
- failed → pending (retry)

**Invalid Transitions:**
- paid → pending, failed, cancelled (prevents reverting paid orders)

**Trigger:**
- `validate_order_state_transition_trigger` on orders table (BEFORE UPDATE)

## How to Apply

### Using Supabase CLI
```bash
# Apply all pending migrations
supabase db push

# Or apply this specific migration
supabase db push --include-all
```

### Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `005_mercadopago_payment_tables.sql`
4. Paste and run the SQL

### Manual Application
```bash
# Connect to your database
psql -h <host> -U <user> -d <database>

# Run the migration
\i supabase/migrations/005_mercadopago_payment_tables.sql
```

## Verification

After applying the migration, verify the tables were created:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'payment_transactions', 'order_status_history');

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('orders', 'payment_transactions', 'order_status_history');

-- Check triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE event_object_schema = 'public' 
AND event_object_table IN ('orders', 'payment_transactions');

-- Test order number generation
SELECT generate_order_number();
```

## Rollback

If you need to rollback this migration:

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS validate_order_state_transition_trigger ON orders;
DROP TRIGGER IF EXISTS log_order_status_change_trigger ON orders;
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;

-- Drop functions
DROP FUNCTION IF EXISTS validate_order_state_transition();
DROP FUNCTION IF EXISTS generate_order_number();
DROP FUNCTION IF EXISTS log_order_status_change();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables (cascade will remove foreign keys)
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
```

## Requirements Validated

This migration satisfies the following requirements from the spec:

- **14.1**: Creates orders table with all required columns
- **14.2**: Creates payment_transactions table with all required columns
- **14.3**: Defines foreign key from payment_transactions.order_id to orders.id
- **14.4**: Defines foreign key from orders.buyer_id to auth.users.id
- **14.5**: Creates index on orders.order_number for fast lookups
- **14.6**: Creates index on payment_transactions.payment_id
- **14.7**: Defines unique constraint on orders.order_number

## Next Steps

After applying this migration:

1. Apply RLS (Row Level Security) policies (separate migration recommended)
2. Create Edge Functions for payment processing
3. Implement frontend components for checkout
4. Test the complete payment flow

## Notes

- The migration uses `IF NOT EXISTS` clauses to be idempotent
- All timestamps use `TIMESTAMPTZ` for timezone awareness
- JSONB columns are used for flexible data storage (items, buyer_data, response_data)
- Automatic triggers handle updated_at timestamps and status history
- State transition validation prevents invalid order status changes
- The order_number generator is thread-safe and handles concurrent requests
