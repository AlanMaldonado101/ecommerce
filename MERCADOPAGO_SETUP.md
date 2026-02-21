# Mercado Pago Payment Integration Setup

This guide explains how to set up and use the Mercado Pago payment integration.

## Prerequisites

1. Mercado Pago account (create at https://www.mercadopago.cl)
2. Access to Mercado Pago credentials (Public Key and Access Token)
3. Supabase project with Edge Functions enabled

## Environment Variables

### Frontend (.env)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MERCADOPAGO_PUBLIC_KEY=your_mercadopago_public_key
```

### Supabase Edge Functions
Set these in your Supabase project settings under Edge Functions secrets:

```bash
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token
supabase secrets set FRONTEND_URL=https://your-domain.com
```

## Deployment

### 1. Deploy Edge Functions

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
