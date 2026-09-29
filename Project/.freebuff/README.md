# 🖥️ CyberHub Integrated Services & Online Shop

A web platform that combines **cyber services** (printing, scanning, typing, KRA/HELB/eCitizen
assistance), **electronics & accessories e-commerce**, and (in later phases) **PlayStation
bookings** — with a full admin dashboard. Phase 1 MVP.

## Tech stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS**
- **Prisma** + **SQLite** (swap to PostgreSQL for production)
- Session auth (HttpOnly cookie), scrypt password hashing
- Payments: **manual recording** (M-Pesa reference codes + cash), admin confirms

## 🚀 Run it (first time)

From the project folder, in PowerShell or CMD:

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Then open **http://localhost:3000**.

> `db:push` creates `prisma/dev.db` (the SQLite database).
> `db:seed` fills it with the admin + customer accounts, categories, products and services.

## 🔑 Demo accounts

| Role     | Email                     | Password    |
| -------- | ------------------------- | ----------- |
| Admin    | admin@cyberhub.co.ke      | admin123    |
| Customer | customer@cyberhub.co.ke   | customer123 |

You can also register new customer accounts from the site.

## 🧭 What's included (Phase 1)

**Storefront**
- Home page with featured services & products
- Product catalog with category filter, cart drawer, checkout (collection or delivery)
- Service catalog grouped by category, request flow with details
- Customer account: orders + service requests with live status
- Payment: M-Pesa reference entry or cash-at-shop, pending admin confirmation

**Admin (`/admin`)**
- Dashboard: customers, orders, pending work, confirmed revenue, low-stock alerts
- Orders: status pipeline (Pending → Paid → Processing → Ready → Completed / Cancelled),
  auto stock deduction on completion
- Service requests: quote with amount + note, progress, complete, reject
- Payments: confirm/reject M-Pesa or cash payments
- Products: add, reprice, restock, hide/show
- Services: add, reprice, hide/show (empty price = quoted per request)

## 🗺️ Later phases

- Phase 2: PlayStation booking engine (stations, time slots, sessions)
- Phase 3: staff roles (cyber attendant, gaming attendant, stock manager), inventory movements
- Phase 4: reports, notifications, feedback, promotions; M-Pesa STK Push via Daraja

## ⚠️ Notes

- `.env` holds a dev-only `AUTH_SECRET` — change it before any real deployment.
- The M-Pesa till number `123456` shown at payment is a placeholder; put the real one in
  `src/app/account/mpesa-reference-form.tsx`.
- SQLite is perfect for development; migrate to PostgreSQL before going live.
