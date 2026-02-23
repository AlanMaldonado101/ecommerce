# Mercado Pago Payment Integration Setup

This guide explains how to set up and use the Mercado Pago payment integration.

## Quick Setup Checklist

- [ ] Add `VITE_MERCADOPAGO_PUBLIC_KEY` to `.env` file
- [ ] Configure `MERCADOPAGO_ACCESS_TOKEN` in Supabase Secrets
- [ ] Configure `FRONTEND_URL` in Supabase Secrets
- [ ] Run database migrations (if not already done)
- [ ] Deploy Edge Functions (`create-preference` and `mercadopago-webhook`)
- [ ] Test checkout flow with test cards
- [ ] Verify webhook processing (optional for MVP)

## Prerequisites

1. Mercado Pago account (create at https://www.mercadopago.cl)
2. Access to Mercado Pago credentials (Public Key and Access Token)
3. Supabase project with Edge Functions enabled

## Environment Variables

### Frontend (.env)
```env
VITE_PROJECT_URL_SUPABASE=https://your-project.supabase.co
VITE_SUPABASE_API_KEY=your_supabase_anon_key
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-18294faa-6945-4f1e-ab29-4647f2c4d5df
```

### Supabase Edge Functions Secrets

Configure these secrets in your Supabase project:

**Option 1: Using Supabase Dashboard**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Edge Functions** → **Secrets**
4. Add the following secrets:

| Secret Name | Value (Development) | Description |
|-------------|---------------------|-------------|
| `MERCADOPAGO_ACCESS_TOKEN` | Your test access token | Private token for Mercado Pago API |
| `FRONTEND_URL` | `http://localhost:5173` | Base URL for payment redirects |

**Option 2: Using Supabase CLI**
```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Set secrets
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=your_test_access_token
supabase secrets set FRONTEND_URL=http://localhost:5173
```

## Test Credentials

### Development/Testing

Use these credentials for development and testing:

**Public Key (Frontend)**
```
TEST-18294faa-6945-4f1e-ab29-4647f2c4d5df
```

**Access Token (Backend/Edge Functions)**
```
Contact your Mercado Pago account administrator for the test access token
```

### Test Cards

Mercado Pago provides test cards to simulate different payment scenarios:

| Scenario | Card Number | CVV | Expiration | Name |
|----------|-------------|-----|------------|------|
| ✅ Approved | 5031 7557 3453 0604 | 123 | 11/25 | APRO |
| ❌ Insufficient funds | 5031 4332 1540 6351 | 123 | 11/25 | FUND |
| ❌ Invalid data | 5031 4418 2388 6781 | 123 | 11/25 | OTHE |
| ⏳ Pending | 5031 4332 1540 6351 | 123 | 11/25 | PEND |

> **Note**: Use any valid CPF/RUT for testing. The card holder name determines the payment result.

More test cards: https://www.mercadopago.cl/developers/es/docs/checkout-api/additional-content/test-cards

### Production Credentials

⚠️ **Important**: Never commit production credentials to version control!

To switch to production:

1. **Get Production Credentials**
   - Go to [Mercado Pago Developers](https://www.mercadopago.cl/developers)
   - Navigate to **Your integrations** → **Credentials**
   - Copy your **Production** Public Key and Access Token

2. **Update Environment Variables**
   ```env
   # .env (Frontend)
   VITE_MERCADOPAGO_PUBLIC_KEY=APP-your-production-public-key
   ```

3. **Update Supabase Secrets**
   ```bash
   supabase secrets set MERCADOPAGO_ACCESS_TOKEN=APP-your-production-access-token
   supabase secrets set FRONTEND_URL=https://your-production-domain.com
   ```

4. **Verify Integration**
   - Test with real payment methods
   - Verify webhooks are being received
   - Check order creation and inventory updates

## Deployment

### 1. Verify Configuration

Before deploying, verify all environment variables are set:

**Frontend (.env)**
```bash
# Check if variables are set
echo $VITE_MERCADOPAGO_PUBLIC_KEY
# Should output: TEST-18294faa-6945-4f1e-ab29-4647f2c4d5df (or your production key)
```

**Supabase Secrets**
```bash
# List all secrets (requires Supabase CLI)
supabase secrets list

# Should show:
# - MERCADOPAGO_ACCESS_TOKEN
# - FRONTEND_URL
```

### 2. Deploy Edge Functions

```bash
# Deploy create-preference function
supabase functions deploy create-preference

# Deploy process-payment function
supabase functions deploy process-payment
```

### 2. Database Setup

The database tables are already created via migrations:
- `orders` - Stores order information
- `payment_transactions` - Stores payment transaction details
- `order_status_history` - Tracks order status changes

## Payment Methods

### Checkout Pro (Redirect)
- User is redirected to Mercado Pago's hosted checkout page
- Simpler integration, handles all payment UI
- Returns to your site after payment

### Checkout API (Embedded)
- Payment form embedded directly in your checkout
- More control over user experience
- Requires card tokenization

## Testing

### Test Credentials
Use Mercado Pago's test credentials for development:
- Test cards: https://www.mercadopago.cl/developers/es/docs/checkout-api/additional-content/test-cards

### Test Flow
1. Add items to cart
2. Go to checkout
3. Fill in shipping information
4. Select payment method (Checkout Pro or Card)
5. Complete payment with test card
6. Verify order is created in database

## Webhook Setup (Optional)

To receive payment notifications:

1. Create webhook endpoint in Mercado Pago dashboard
2. Point to: `https://your-supabase-url.supabase.co/functions/v1/mercadopago-webhook`
3. Select events: `payment.created`, `payment.updated`

## Troubleshooting

### Payment fails with "Unauthorized"
- Check that user is logged in
- Verify Supabase session is valid

### "Invalid order amount" error
- Ensure cart items prices match what's sent to backend
- Check for currency conversion issues

### Mercado Pago SDK not loading
- Verify `VITE_MERCADOPAGO_PUBLIC_KEY` is set
- Check browser console for script loading errors

## Security Notes

- Never expose your Access Token in frontend code
- Always validate order amounts on the backend
- Use RLS policies to protect order data
- Validate webhook signatures (already implemented)

## Support

For Mercado Pago API documentation:
- https://www.mercadopago.cl/developers/es/docs
