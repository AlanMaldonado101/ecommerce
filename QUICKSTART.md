# Mercado Pago Integration - Quick Start Guide

## 1. Get Mercado Pago Credentials

1. Go to https://www.mercadopago.cl/developers
2. Create an application
3. Get your credentials:
   - **Public Key** (starts with `APP_USR-`)
   - **Access Token** (starts with `APP_USR-`)

## 2. Configure Environment Variables

### Frontend (.env file in root)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-your-public-key
```

### Supabase Edge Functions
```bash
# Set secrets in Supabase
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=APP_USR-your-access-token
supabase secrets set FRONTEND_URL=http://localhost:5173
```

Or via Supabase Dashboard:
1. Go to Project Settings → Edge Functions
2. Add secrets:
   - `MERCADOPAGO_ACCESS_TOKEN`
   - `FRONTEND_URL`

## 3. Deploy Edge Functions

```bash
# Make sure you're logged in to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy create-preference
supabase functions deploy process-payment
```

## 4. Test the Integration

### Using Test Credentials
For testing, use Mercado Pago's test credentials:
- Get test credentials from: https://www.mercadopago.cl/developers/panel/app

### Test Cards (Chile)
```
Visa: 4168 8188 4444 7115
Mastercard: 5416 7526 0258 2580
CVV: 123
Expiry: Any future date
Name: APRO (for approved)
Document: 11111111-1
```

### Test Flow
1. Start your frontend: `npm run dev`
2. Add items to cart
3. Go to checkout
4. Fill shipping information
5. Select payment method
6. For Checkout Pro: Click "Continuar con Mercado Pago"
7. For Card: Fill card form with test data
8. Complete payment
9. Verify order in database

## 5. Verify Database

Check that orders are being created:

```sql
-- View recent orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- View payment transactions
SELECT * FROM payment_transactions ORDER BY created_at DESC LIMIT 10;

-- View order status history
SELECT * FROM order_status_history ORDER BY created_at DESC LIMIT 10;
```

## 6. Common Issues

### "Unauthorized" error
- Check user is logged in
- Verify Supabase session is valid
- Check RLS policies are enabled

### "Invalid order amount" error
- Verify cart items prices are correct
- Check currency is CLP

### Mercado Pago SDK not loading
- Verify `VITE_MERCADOPAGO_PUBLIC_KEY` is set
- Check browser console for errors
- Ensure public key is correct

### Edge Function errors
- Check function logs: `supabase functions logs create-preference`
- Verify secrets are set correctly
- Check Mercado Pago credentials are valid

## 7. Go Live

### Switch to Production
1. Get production credentials from Mercado Pago
2. Update environment variables with production keys
3. Update `FRONTEND_URL` to your production domain
4. Redeploy Edge Functions
5. Test with real cards (small amounts first)

### Production Checklist
- [ ] Production Mercado Pago credentials configured
- [ ] Frontend URL updated to production domain
- [ ] Edge Functions deployed with production secrets
- [ ] SSL certificate active (HTTPS)
- [ ] Test with real payment (small amount)
- [ ] Webhook configured (optional)
- [ ] Error monitoring set up
- [ ] Order confirmation emails configured

## Need Help?

- Mercado Pago Docs: https://www.mercadopago.cl/developers/es/docs
- Supabase Docs: https://supabase.com/docs
- Check `MERCADOPAGO_SETUP.md` for detailed setup
- Check `IMPLEMENTATION_SUMMARY.md` for technical details
