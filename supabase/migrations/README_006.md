# Migration 006: Row Level Security Policies for Mercado Pago Tables

## Overview

This migration implements Row Level Security (RLS) policies for the Mercado Pago payment integration tables to ensure data protection and proper access control.

## Requirements Addressed

- **15.1**: Enable Row Level Security on orders table
- **15.2**: Enable Row Level Security on payment_transactions table
- **15.3**: Users can view only their own orders
- **15.4**: Users can create orders only with their own buyer_id
- **15.5**: Users can view payment_transactions only of their orders
- **15.6**: Edge Functions with service_role have full access
- **15.7**: Prevent direct modification of orders by users

## Security Model

### For Regular Users (Authenticated)

#### orders Table
- **SELECT**: Users can view only orders where `buyer_id = auth.uid()`
- **INSERT**: Users can create orders only with their own `buyer_id`
- **UPDATE**: Blocked - users cannot update orders directly
- **DELETE**: Blocked - users cannot delete orders

#### payment_transactions Table
- **SELECT**: Users can view transactions only for their own orders (via JOIN)
- **INSERT**: Blocked - only Edge Functions can create transactions
- **UPDATE**: Blocked - only Edge Functions can update transactions
- **DELETE**: Blocked - transactions are immutable

#### order_status_history Table
- **SELECT**: Users can view history only for their own orders (via JOIN)
- **INSERT**: Blocked - only triggers and Edge Functions create history
- **UPDATE**: Blocked - history records are immutable
- **DELETE**: Blocked - history records are permanent audit logs

### For Service Role (Edge Functions)

All Edge Functions using the `service_role` key have **full access** to all tables for all operations. This is necessary for:

- Creating orders and transactions
- Processing webhook notifications
- Updating order statuses
- Managing payment flows

## Policy Details

### orders Table Policies

1. **"Users can view their own orders"**
   - Type: SELECT
   - Logic: `auth.uid() = buyer_id`
   - Purpose: Users see only their purchases

2. **"Users can create orders for themselves"**
   - Type: INSERT
   - Logic: `auth.uid() = buyer_id`
   - Purpose: Prevent users from creating orders for others

3. **"Users cannot update orders"**
   - Type: UPDATE
   - Logic: `false`
   - Purpose: Orders can only be updated by Edge Functions

4. **"Users cannot delete orders"**
   - Type: DELETE
   - Logic: `false`
   - Purpose: Orders are permanent records

5. **"Service role can do everything on orders"**
   - Type: ALL
   - Logic: `auth.jwt()->>'role' = 'service_role'`
   - Purpose: Edge Functions need full control

### payment_transactions Table Policies

1. **"Users can view transactions of their orders"**
   - Type: SELECT
   - Logic: EXISTS subquery checking order ownership
   - Purpose: Users see payment details only for their orders

2. **"Users cannot insert transactions"**
   - Type: INSERT
   - Logic: `false`
   - Purpose: Only Edge Functions create transactions

3. **"Users cannot update transactions"**
   - Type: UPDATE
   - Logic: `false`
   - Purpose: Transactions are immutable records

4. **"Users cannot delete transactions"**
   - Type: DELETE
   - Logic: `false`
   - Purpose: Transactions are permanent audit records

5. **"Service role can do everything on payment_transactions"**
   - Type: ALL
   - Logic: `auth.jwt()->>'role' = 'service_role'`
   - Purpose: Edge Functions manage all transaction operations

### order_status_history Table Policies

1. **"Users can view history of their orders"**
   - Type: SELECT
   - Logic: EXISTS subquery checking order ownership
   - Purpose: Users can track status changes of their orders

2. **"Users cannot insert history records"**
   - Type: INSERT
   - Logic: `false`
   - Purpose: Only triggers and Edge Functions create history

3. **"Users cannot update history records"**
   - Type: UPDATE
   - Logic: `false`
   - Purpose: History is immutable audit trail

4. **"Users cannot delete history records"**
   - Type: DELETE
   - Logic: `false`
   - Purpose: History is permanent audit trail

5. **"Service role can do everything on order_status_history"**
   - Type: ALL
   - Logic: `auth.jwt()->>'role' = 'service_role'`
   - Purpose: Edge Functions need to create history records

## Testing the Policies

### Test User Access

```sql
-- As authenticated user (should see only their orders)
SELECT * FROM orders;

-- As authenticated user (should fail - cannot update)
UPDATE orders SET status = 'paid' WHERE id = 'some-uuid';

-- As authenticated user (should see only transactions for their orders)
SELECT * FROM payment_transactions;
```

### Test Service Role Access

```sql
-- As service_role (should see all orders)
SELECT * FROM orders;

-- As service_role (should succeed)
UPDATE orders SET status = 'paid' WHERE id = 'some-uuid';

-- As service_role (should succeed)
INSERT INTO payment_transactions (...) VALUES (...);
```

## Edge Function Usage

When calling Supabase from Edge Functions, use the service role client:

```typescript
import { createClient } from '@supabase/supabase-js';

// Create client with service_role key
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // Important: use service_role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Now you can perform any operation
await supabase.from('orders').update({ status: 'paid' }).eq('id', orderId);
```

## Security Considerations

1. **Never expose service_role key to frontend**: The service_role key bypasses RLS and should only be used in Edge Functions.

2. **Validate buyer_id in Edge Functions**: Even though RLS enforces buyer_id matching, Edge Functions should validate that the authenticated user matches the buyer_id in requests.

3. **Immutable records**: Transactions and history records are designed to be immutable for audit purposes.

4. **Webhook security**: Webhooks use service_role to update orders, so webhook signature validation is critical.

## Migration Application

To apply this migration:

```bash
# Using Supabase CLI
supabase db push

# Or apply directly
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/006_mercadopago_rls_policies.sql
```

## Rollback

To rollback this migration:

```sql
-- Disable RLS
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history DISABLE ROW LEVEL SECURITY;

-- Drop all policies
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders for themselves" ON orders;
DROP POLICY IF EXISTS "Users cannot update orders" ON orders;
DROP POLICY IF EXISTS "Users cannot delete orders" ON orders;
DROP POLICY IF EXISTS "Service role can do everything on orders" ON orders;

DROP POLICY IF EXISTS "Users can view transactions of their orders" ON payment_transactions;
DROP POLICY IF EXISTS "Users cannot insert transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Users cannot update transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Users cannot delete transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Service role can do everything on payment_transactions" ON payment_transactions;

DROP POLICY IF EXISTS "Users can view history of their orders" ON order_status_history;
DROP POLICY IF EXISTS "Users cannot insert history records" ON order_status_history;
DROP POLICY IF EXISTS "Users cannot update history records" ON order_status_history;
DROP POLICY IF EXISTS "Users cannot delete history records" ON order_status_history;
DROP POLICY IF EXISTS "Service role can do everything on order_status_history" ON order_status_history;
```

## Related Files

- **Migration 005**: Creates the base tables (orders, payment_transactions, order_status_history)
- **Design Document**: `.kiro/specs/mercadopago-payment-integration/design.md`
- **Requirements**: `.kiro/specs/mercadopago-payment-integration/requirements.md`
