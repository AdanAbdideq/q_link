# Q-LINK Kenya — Supabase Migration Guide

This document covers everything you need to go from the original prototype
to a production-ready app backed by Supabase.

---

## What changed

| Area | Before | After |
|---|---|---|
| Auth | Fake `setTimeout` login | Real Supabase Auth (email/password) |
| Data | `mockData.ts` in-memory arrays | Supabase Postgres + Row Level Security |
| State management | `useState` chains in `App.tsx` | Zustand store (`src/store/appStore.ts`) |
| Login forms | No sign-up, no real validation | Sign-in + Sign-up with full validation |
| `framer-motion` bug | Imported but not in `package.json` | Removed entirely (no missing dependency) |
| Admin sections | Disconnected from real data | Live counts from DB |

---

## 1 — Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign in (free tier is fine).
2. Click **New project**, choose a name and a strong DB password.
3. Wait ~2 minutes for the project to provision.

---

## 2 — Run the database schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar.
2. Open `supabase/schema.sql` from this project.
3. Paste the entire file and click **Run**.

This creates:
- `profiles` — extends `auth.users`, stores name / phone / role / location
- `service_categories` — seeded with 8 Kenyan service types
- `service_providers` — linked to profiles, holds business info
- `bookings` — full booking lifecycle with QR code
- `reviews` — auto-updates provider rating on insert
- `announcements` — admin-broadcast messages

Row Level Security (RLS) is enabled on every table so users can only
read/write their own data, except admins who can see everything.

---

## 3 — Get your API keys

1. In Supabase, go to **Settings → API**.
2. Copy **Project URL** and **anon / public key**.
3. In this project root, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

4. Fill in the values:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 4 — Create the admin user

The admin login uses a real email address (not a phone number).

1. In Supabase → **Authentication → Users**, click **Add user**.
2. Enter `admin@qlink.co.ke` (or your preferred email) and a strong password.
3. After the user is created, open **SQL Editor** and run:

```sql
-- Make this user an admin (replace the email if you used a different one)
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@qlink.co.ke'
);
```

---

## 5 — Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## 6 — Test the full flow

### As a Customer
1. Click **Customer** on the role selector.
2. Switch to the **Register** tab and create an account.
3. Sign in and browse services → select a provider → book.

### As a Provider
1. Click **Service Provider** on the role selector.
2. Switch to **Register**, fill in all fields, submit.
3. Your account will show as "pending approval" until the admin approves it.

### As Admin
1. Click **Administrator**, sign in with `admin@qlink.co.ke`.
2. Go to **Provider Approvals** and approve the provider you registered.
3. The provider can now log in and appear in customer searches.

---

## 7 — How auth works (phone-based)

Supabase's built-in phone OTP requires a paid Twilio add-on.
For now, we use a simple workaround: the phone number is converted to a
pseudo-email (`254712345678@qlink.local`) and Supabase's email/password
auth is used.

**To upgrade to real SMS OTP (production):**

1. In Supabase → **Authentication → Providers**, enable **Phone**.
2. Connect your Twilio (or Africa's Talking) account.
3. In `src/context/AuthContext.tsx`, replace `signInWithPhone` and
   `signUpCustomer` to call `supabase.auth.signInWithOtp({ phone })` and
   `supabase.auth.verifyOtp({ phone, token, type: 'sms' })`.

---

## 8 — Real-time (optional upgrade)

The hooks in `src/hooks/useSupabase.ts` use one-time fetches.
To get live updates (e.g. booking status changing in real time):

```ts
// Example: subscribe to a provider's bookings in real time
useEffect(() => {
  const channel = supabase
    .channel('provider-bookings')
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'bookings',
      filter: `provider_id=eq.${providerId}`,
    }, () => refetch())
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, [providerId]);
}, [providerId, refetch]);
```

---

## 9 — M-Pesa integration (next step)

Q-LINK references M-Pesa throughout the UI. To wire it up:

1. Register at [Safaricom Developer Portal](https://developer.safaricom.co.ke/).
2. Get your Consumer Key / Secret for the Daraja API.
3. Create a Supabase **Edge Function** (`supabase/functions/mpesa-stk-push/`)
   that calls the STK Push endpoint — this keeps your secret off the client.
4. Trigger the function from `BookingFlow.tsx` on booking confirmation.

---

## File structure of new files

```
src/
├── context/
│   └── AuthContext.tsx      ← Supabase auth provider (sign-in, sign-up, sign-out)
├── store/
│   └── appStore.ts          ← Zustand store (replaces useState chains in App.tsx)
├── hooks/
│   └── useSupabase.ts       ← All data-fetching hooks + mutation helpers
├── lib/
│   └── supabase.ts          ← Supabase client + DB type definitions
supabase/
└── schema.sql               ← Full Postgres schema + RLS + seed data
.env.example                 ← Environment variable template
```
