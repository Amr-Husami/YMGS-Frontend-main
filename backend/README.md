# YMGS Backend

REST API for the YMGS Pharmacy React frontend. Built with **Node.js + Express**, using **Supabase (PostgreSQL)** for storage and **JWT** for authentication.

## Stack

- Express 4
- `@supabase/supabase-js` (PostgreSQL access)
- `jsonwebtoken` + `bcryptjs` (auth)
- `cors`, `morgan`, `dotenv`

## Project structure

```
backend/
├── server.js              # App entry: CORS, JSON, routes, error handling
├── db/schema.sql          # Tables to run once in the Supabase SQL editor
├── .env.example           # Template for environment variables
└── src/
    ├── config/supabase.js # Supabase client
    ├── middleware/        # auth (JWT/admin) + error handling
    └── routes/            # auth, products, orders, users
```

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Create the database tables

Open your Supabase dashboard → **SQL Editor** → **New query**, paste the
contents of [`db/schema.sql`](db/schema.sql), and run it. This creates the
`users`, `products`, `orders`, `addresses`, `coupons`, `crypto_wallets`,
`settings`, `blogs`, and `contact_messages` tables.

> ⚠️ **Destructive:** the script begins by `DROP TABLE ... CASCADE` on the
> tables it manages (so it can recreate them with the right structure). Run it
> only on a database where losing those tables is acceptable.

### 3. Configure environment variables

```bash
cp .env.example .env
```

A `.env` is already provided with your project URL, anon key, and a generated
`JWT_SECRET`. The one thing you should add for full functionality is the
**service-role key**:

| Variable | Required | Notes |
|---|---|---|
| `PORT` | no | Defaults to `4000`. |
| `CORS_ORIGINS` | yes | Comma-separated allowed frontend origins. |
| `SUPABASE_URL` | yes | Your project URL. |
| `SUPABASE_ANON_KEY` | yes | Public/publishable key. |
| `SUPABASE_SERVICE_ROLE_KEY` | **recommended** | Lets the backend bypass Row Level Security for writes and admin reads. Get it from Supabase → Settings → API → `service_role`. **Never put this in the frontend.** |
| `JWT_SECRET` | yes | Secret for signing tokens. |
| `JWT_EXPIRES_IN` | no | Defaults to `7d`. |

> **Why the service-role key matters:** the anon key is restricted by Supabase
> Row Level Security. Without it (and without RLS policies), inserting products
> or reading all users may be blocked. The schema ships with RLS **disabled**
> so it works immediately; enable RLS + policies before going to production.

### 4. Run

```bash
npm run dev     # auto-restart on file changes (node --watch)
# or
npm start
```

You should see `YMGS backend listening on http://localhost:4000`.
Check it: `curl http://localhost:4000/api/health`

## Connecting the React frontend

The frontend reads `VITE_BACKEND_URL`. In the project root `.env`:

```
VITE_BACKEND_URL=http://localhost:4000
```

`http://localhost:5173` (Vite) and `http://localhost:3000` are already in the
default `CORS_ORIGINS`.

## API reference

Routes match exactly what the YMGS storefront calls. All responses are JSON
shaped as `{ success: boolean, ... }`. Authenticated routes accept the JWT
either as `Authorization: Bearer <token>` or a `token` header (the convention
the frontend uses). `admin` routes additionally require `role = 'admin'`.

### User / auth

| Method | Path | Body | Auth |
|---|---|---|---|
| POST | `/api/user/register` | `{ name, email, password }` → `{ token, user }` | – |
| POST | `/api/user/login` | `{ email, password }` → `{ token, user }` | – |
| GET | `/api/user/list` | All users | admin |
| GET | `/api/user/:id` | Single user | owner/admin |

### Products

| Method | Path | Notes | Auth |
|---|---|---|---|
| POST | `/api/product/user/list` | Body: `page, limit, category, subCategory, search, bestseller, excludeId, sortBy(date\|price\|name), sortOrder`. `category`/`subCategory` may be a string or array. Returns `{ products, pagination }`. | – |
| GET | `/api/product/:id` | Single product | – |
| POST | `/api/product/add` | Create | admin |
| PUT | `/api/product/:id` | Update (partial) | admin |
| DELETE | `/api/product/:id` | Delete | admin |

### Cart (stored per user)

| Method | Path | Body | Auth |
|---|---|---|---|
| POST | `/api/cart/add` | `{ itemId, cartData }` | user |
| POST | `/api/cart/update` | `{ itemId, cartData }` (quantity 0 removes) | user |
| POST | `/api/cart/get` | – → `{ cartData }` | user |

### Orders

| Method | Path | Body / notes | Auth |
|---|---|---|---|
| POST | `/api/order/place` | COD order: `{ items, amount, originalAmount, address, billingAddress, notes, couponCode }` | user |
| POST | `/api/order/manual` | As above + `manualPaymentDetails` | user |
| POST | `/api/order/guest` | As above, no login (needs `address.email`) | – |
| POST | `/api/order/userorders` | `{ page, limit }` (token) **or** `{ email, page, limit }` | token/email |
| POST | `/api/order/verify-coupon` | `{ couponCode, amount }` → `{ couponDetails: { discount } }` | – |
| GET | `/api/order/settings` | Store settings (footer/contact) | – |
| GET | `/api/order/crypto-wallets` | Wallets for manual crypto payment | – |
| GET | `/api/order/list` | All orders | admin |
| PUT | `/api/order/:id/status` | `{ status, payment }` | admin |

### Addresses

| Method | Path | Body | Auth |
|---|---|---|---|
| GET | `/api/address/get` | → `{ addresses }` | user |
| POST | `/api/address/save` | `{ address }` → `{ addresses }` | user |

### Blogs

| Method | Path | Auth |
|---|---|---|
| GET | `/api/blog/list?page=&limit=` | – |
| GET | `/api/blog/:id` | – |
| POST | `/api/blog/add` | admin |
| DELETE | `/api/blog/:id` | admin |

### Contact

| Method | Path | Body | Auth |
|---|---|---|---|
| POST | `/api/contact/submit` | `{ name, email, phone, subject, message }` | – |
| GET | `/api/contact/list` | Submissions | admin |

Password hashes are never returned.

## Quick test

```bash
# Register
curl -X POST http://localhost:4000/api/user/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'

# Products (storefront listing)
curl -X POST http://localhost:4000/api/product/user/list \
  -H 'Content-Type: application/json' -d '{"limit":5}'
```

## Creating an admin user

Registration always creates a `user`. To make someone an admin, run this in the
Supabase SQL editor:

```sql
update public.users set role = 'admin' where email = 'you@example.com';
```

The admin account is required to log into the [admin dashboard](../admin) and to
call any `admin` route above.

## Not implemented

The storefront also references payment-gateway routes that are **out of scope**
here: `/api/order/stripe`, `/api/order/razorpay`, `/api/order/verifyStripe`,
`/api/order/verifyRazorpay`. Add these if/when you wire up Stripe/Razorpay.

`.env` is gitignored — never commit real secrets.
```
