# Newsletter Setup Guide for Sift

## Overview
This guide outlines the steps to set up the newsletter functionality using Resend and Supabase.

## Prerequisites
1. **Resend Account**: Sign up at https://resend.com (free tier: 100 emails/day)
2. **Supabase Project**: Existing Sift project
3. **Domain Setup**: Verify your domain in Resend for better deliverability

## Setup Steps

### 1. Database Setup

Run the SQL migration in your Supabase SQL Editor:

```bash
# Copy contents of supabase/subscribers.sql and run in Supabase SQL Editor
```

This creates:
- `subscribers` table
- `email_history` table
- Helper functions: `subscribe_email()`, `verify_subscription()`, `unsubscribe_email()`

### 2. Environment Variables

Add to your `.env` file:

```env
# Resend Email API
RESEND_API_KEY=re_xxxxxxxxxxxxx
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxx
VITE_APP_URL=https://sifted-insight.com
```

### 3. Edge Functions Setup

Deploy the Edge Functions in Supabase Dashboard:

1. **send-daily-digest**
   - Path: `supabase/functions/send-daily-digest.ts`
   - Purpose: Sends daily/weekly digest emails to subscribers
   
2. **send-confirmation**
   - Path: `supabase/functions/send-confirmation.ts`
   - Purpose: Sends verification emails to new subscribers

**Environment Variables for Edge Functions:**
- `RESEND_API_KEY`: Your Resend API key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key
- `APP_URL`: Your app URL (https://sifted-insight.com)

### 4. Cron Job Setup

Set up daily cron jobs to trigger the digest:

**Option A: Supabase Cron (Recommended)**
```sql
SELECT cron.schedule(
  'daily-digest',
  '0 8 * * *',
  $$
  SELECT
    $$
);
```

**Option B: External Trigger**
```bash
curl -X POST 'https://[project-id].supabase.co/functions/v1/send-daily-digest' \
  -H 'Authorization: Bearer [EDGE_FUNCTION_API_KEY]' \
  -H 'Content-Type: application/json' \
  -d '{"frequency": "daily"}'
```

### 5. Frontend Components

The following components are included:

| Component | Path | Purpose |
|-----------|------|---------|
| `NewsletterSignup` | `src/components/NewsletterSignup.tsx` | Signup form with frequency/category options |
| `useNewsletter` | `src/hooks/useNewsletter.ts` | Hook for subscription management |
| `resend.ts` | `src/integrations/resend.ts` | Resend API integration |
| `UnsubscribePage` | `src/pages/Unsubscribe.tsx` | Unsubscribe landing page |
| `VerifyPage` | `src/pages/Verify.tsx` | Email verification page |

### 6. Database Types

Update your Supabase types:

```bash
# In Supabase Dashboard:
# Settings > API > Type definitions > Copy and replace in src/integrations/supabase/types.ts
```

## Email Templates

### Confirmation Email
- **Subject**: Confirm your Sift newsletter subscription
- **Content**: Verification link with frequency confirmation

### Daily Digest
- **Frequency**: Daily at 8 AM
- **Content**: Top 5 ranked articles with AI summaries
- **Personalization**: Category filtering supported

### Weekly Recap
- **Frequency**: Weekly on Sundays
- **Content**: Top 15 ranked articles
- **Personalization**: Category filtering supported

## API Reference

### Database Functions

#### `subscribe_email(p_email, p_frequency, p_categories)`
- Creates new subscriber or resends verification
- Returns: `{ success: boolean, message: string, verification_token?: string }`

#### `verify_subscription(p_token)`
- Verifies email address
- Returns: `{ success: boolean, message: string }`

#### `unsubscribe_email(p_token, p_reason)`
- Unsubscribes user
- Returns: `{ success: boolean, message: string }`

### Edge Functions

#### POST `/functions/v1/send-daily-digest`
```json
{
  "frequency": "daily" | "weekly",
  "dryRun": true | false
}
```

#### POST `/functions/v1/send-confirmation`
```json
{
  "subscriberId": "uuid"
}
```

## Testing

### 1. Test Subscription
1. Go to Sift homepage
2. Enter email in footer signup form
3. Check confirmation email

### 2. Test Verification
1. Click verification link in email
2. Should redirect to success page

### 3. Test Digest (Dry Run)
```bash
curl -X POST 'https://[project-id].supabase.co/functions/v1/send-daily-digest' \
  -H 'Authorization: Bearer [EDGE_FUNCTION_API_KEY]' \
  -H 'Content-Type: application/json' \
  -d '{"frequency": "daily", "dryRun": true}'
```

## Troubleshooting

### Emails Not Sending
1. Check Resend API key is valid
2. Verify domain is verified in Resend
3. Check Supabase Edge Function logs

### Verification Fails
1. Verify token hasn't expired (7 days default)
2. Check database has the subscriber record

### Styling Issues
1. Ensure Tailwind CSS is configured
2. Check for missing CSS imports

## Best Practices

1. **Email Deliverability**
   - Verify domain in Resend
   - Set up SPF/DKIM records
   - Use a dedicated sending domain

2. **Subscriber Management**
   - Clean up unverified subscribers after 7 days
   - Track email opens/clicks for engagement

3. **Rate Limiting**
   - Resend free tier: 10 emails/second
   - Add delays in bulk sending

4. **Compliance**
   - Include unsubscribe link in all emails
   - Honor unsubscribe requests immediately
   - Store consent records

## Security Considerations

1. **API Keys**
   - Never expose service role key in frontend
   - Use Edge Functions for sensitive operations

2. **Token Management**
   - Use cryptographically secure tokens
   - Set appropriate expiration times

3. **Email Validation**
   - Validate email format before submission
   - Consider using email verification services
