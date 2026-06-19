# YMGS Admin Dashboard

A React + Vite admin panel for managing the YMGS store via the Express backend.

## Features

- **JWT auth** — login required; all pages redirect to `/login` when there's no
  valid token, and any `401` from the API clears the session automatically.
  Only accounts with `role = 'admin'` can sign in.
- **Products** — list, add, edit, delete (modal form).
- **Orders** — list all orders and update their status.
- **Users** — list all registered users.
- Tailwind CSS UI, `react-toastify` for feedback.

## Setup

```bash
cd admin
npm install
cp .env.example .env   # already points at http://localhost:4000
npm run dev            # http://localhost:5174
```

`VITE_BACKEND_URL` controls which backend it talks to. The backend's
`CORS_ORIGINS` already allows `http://localhost:5174`.

## Prerequisites

1. The backend must be running (`cd ../backend && npm run dev`).
2. You need an **admin** account. Register one via the storefront or:

   ```bash
   curl -X POST http://localhost:4000/api/auth/register \
     -H 'Content-Type: application/json' \
     -d '{"name":"Admin","email":"admin@ymgs.com","password":"password123"}'
   ```

   Then promote it in the Supabase SQL editor:

   ```sql
   update public.users set role = 'admin' where email = 'admin@ymgs.com';
   ```

   Log in with those credentials at `http://localhost:5174/login`.

## Structure

```
admin/src/
├── api/client.js            # axios instance, injects JWT, handles 401
├── context/AuthContext.jsx  # login/logout, token in localStorage
├── components/
│   ├── ProtectedRoute.jsx   # redirects to /login if unauthenticated
│   └── Layout.jsx           # sidebar nav + logout
└── pages/
    ├── Login.jsx
    ├── Products.jsx
    ├── Orders.jsx
    └── Users.jsx
```

## Build

```bash
npm run build    # outputs to dist/
npm run preview
```
