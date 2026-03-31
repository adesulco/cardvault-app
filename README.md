# CardVault

Secure peer-to-peer marketplace for trading cards & collectibles with escrow-protected payments.

## Features

- **Escrow Payments** — Funds held securely until buyer confirms receipt (Midtrans, Xendit, Stripe, PayPal)
- **IDR-First** — Indonesian Rupiah as primary currency with live USD conversion
- **Card Collection** — Upload, manage, and showcase your physical cards digitally
- **Marketplace** — Search, filter, buy, sell, and make offers
- **Trust System** — Ratings, KYC verification, and trust scores
- **Admin Dashboard** — Transaction monitoring, dispute resolution, gateway health
- **Mobile-First PWA** — Installable web app optimized for mobile

## Tech Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS · Prisma ORM · SQLite/PostgreSQL · Zustand

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full GitHub + Vercel deployment guide.

## Project Structure

```
src/
├── app/                  # Next.js pages and API routes
│   ├── admin/            # Admin dashboard
│   ├── api/              # REST API endpoints
│   ├── auth/             # Login and registration
│   ├── cards/            # Card collection management
│   ├── checkout/         # Payment and escrow flow
│   ├── marketplace/      # Browse and search listings
│   ├── messages/         # In-app messaging
│   ├── notifications/    # Notification feed
│   ├── profile/          # User profile
│   └── transactions/     # Escrow transaction tracking
├── components/           # Reusable UI components
├── lib/                  # Utilities and business logic
│   ├── currency.ts       # IDR/USD conversion
│   ├── payment-gateway.ts # PGAL (Payment Gateway Abstraction Layer)
│   ├── store.ts          # Zustand global state
│   └── types.ts          # TypeScript interfaces
prisma/
└── schema.prisma         # Database schema (15 models)
```
