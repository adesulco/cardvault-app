# CardVault Deployment Guide

## Go-Live: GitHub + Vercel for QA Testing

This guide walks you through pushing CardVault to GitHub and deploying it on Vercel so your team can QA test the full application with a live URL.

---

## Prerequisites

- A **GitHub account** (https://github.com)
- A **Vercel account** (https://vercel.com — sign up with your GitHub account)
- **Node.js 18+** installed on your computer
- **Git** installed on your computer

---

## Step 1: Install the GitHub CLI

The GitHub CLI (`gh`) makes it easy to create repos and manage code from the terminal.

**macOS:**
```bash
brew install gh
```

**Windows:**
```bash
winget install --id GitHub.cli
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt install gh
```

After installing, authenticate:
```bash
gh auth login
```
- Choose **GitHub.com**
- Choose **HTTPS** as the preferred protocol
- Authenticate with your **browser** (it will open a link)

Verify it works:
```bash
gh auth status
```

---

## Step 2: Push Code to GitHub

Open your terminal and navigate to the CardVault project folder:

```bash
cd path/to/Rekber/cardvault
```

Create a new GitHub repository and push your code:

```bash
# Create a private GitHub repo and push everything in one command
gh repo create cardvault --private --source=. --remote=origin --push
```

This will:
1. Create a private repo called `cardvault` on your GitHub account
2. Set it as the `origin` remote
3. Push all your code to the `main` branch

If you want a **public** repo instead (so QA testers can see the code), replace `--private` with `--public`.

**Verify it worked:**
```bash
gh repo view --web
```
This opens the repository in your browser.

---

## Step 3: Deploy to Vercel

### Option A: Via Vercel Website (Easiest)

1. Go to **https://vercel.com** and sign in with your GitHub account
2. Click **"Add New Project"**
3. Find and select your **cardvault** repository
4. Vercel auto-detects it's a Next.js project — leave the defaults
5. Under **Environment Variables**, add these (click "Add" for each):

   | Key | Value |
   |-----|-------|
   | `NEXTAUTH_SECRET` | Generate one: run `openssl rand -base64 32` in your terminal |
   | `NEXTAUTH_URL` | Leave blank for now (Vercel sets this automatically) |
   | `NEXT_PUBLIC_APP_URL` | Leave blank for now |
   | `DATABASE_URL` | `file:./dev.db` (for SQLite demo) |
   | `MIDTRANS_SERVER_KEY` | Your Midtrans sandbox key (or `SB-Mid-server-xxx` for demo) |
   | `MIDTRANS_CLIENT_KEY` | Your Midtrans sandbox key (or `SB-Mid-client-xxx` for demo) |
   | `STRIPE_SECRET_KEY` | Your Stripe test key (or `sk_test_xxx` for demo) |
   | `STRIPE_PUBLISHABLE_KEY` | Your Stripe test publishable key (or `pk_test_xxx` for demo) |

6. Click **"Deploy"**
7. Wait 1-2 minutes — Vercel will build and deploy your app
8. You'll get a live URL like: **https://cardvault-xxxxx.vercel.app**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from the project directory
cd path/to/Rekber/cardvault
vercel

# Follow the prompts:
# - Link to your Vercel account
# - Set up new project: Yes
# - Project name: cardvault
# - Framework: Next.js (auto-detected)
# - Build/output settings: leave defaults

# For production deploy:
vercel --prod
```

---

## Step 4: Share with Your QA Team

After deployment, you'll have a live URL. Share it with your team:

**Your QA Testing URL:** `https://cardvault-xxxxx.vercel.app`

Key pages for QA testing:

| Page | URL | What to Test |
|------|-----|--------------|
| Home | `/` | Hero banner, categories, trending cards, currency toggle |
| Marketplace | `/marketplace` | Search, filters, sort, card grid |
| Listing Detail | `/marketplace/l1` | Card details, pricing, make offer, buy now |
| Add Card | `/cards/new` | Form validation, photo upload, cert lookup, list for sale |
| My Collection | `/cards` | Card display, status filters |
| Checkout | `/checkout/l1` | Payment method selection, escrow flow, fee breakdown |
| Transactions | `/transactions` | Escrow progress tracker, status badges |
| Messages | `/messages` | Conversation list, chat interface |
| Profile | `/profile` | User info, trust score, menu navigation |
| Notifications | `/notifications` | Notification types, read/unread states |
| Login | `/auth/login` | Form, social login buttons |
| Register | `/auth/register` | Form, country/currency selection |
| Admin | `/admin` | Dashboard stats, gateway health, disputes |

---

## Step 5: Set Up Preview Deployments (Automatic QA for Each Feature)

One of Vercel's best features is **preview deployments** — every pull request gets its own URL automatically.

To use this workflow:

```bash
# Create a branch for a feature
git checkout -b feature/your-feature-name

# Make changes, then push
git add .
git commit -m "Add feature X"
git push -u origin feature/your-feature-name

# Create a pull request
gh pr create --title "Add feature X" --body "Description of changes"
```

Vercel will automatically deploy a preview URL for that PR (e.g., `https://cardvault-git-feature-xxx.vercel.app`). Your QA team can test each feature independently before merging to main.

---

## Step 6: Set Up a Production Database (When Ready)

The current setup uses SQLite (demo mode). When you're ready for real data:

### Option 1: Vercel Postgres (Easiest)
1. Go to your Vercel project dashboard
2. Click **Storage** tab → **Create Database** → **Postgres**
3. Vercel automatically adds the `DATABASE_URL` environment variable
4. Update `prisma/schema.prisma`: change `provider = "sqlite"` to `provider = "postgresql"`
5. Run `npx prisma migrate dev` locally, then push

### Option 2: Supabase (Free Tier)
1. Create a project at https://supabase.com
2. Copy the connection string from Project Settings → Database
3. Add it as `DATABASE_URL` in Vercel environment variables

### Option 3: Railway
1. Create a PostgreSQL database at https://railway.app
2. Copy the connection URL
3. Add it as `DATABASE_URL` in Vercel environment variables

---

## Useful Commands

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs

# Roll back to previous deployment
vercel rollback

# Set environment variables
vercel env add VARIABLE_NAME

# View current environment
vercel env ls

# Open project in browser
vercel open

# Check GitHub repo
gh repo view --web

# Create a new PR for QA
gh pr create --title "Feature: X" --body "Ready for QA testing"

# List open PRs
gh pr list
```

---

## Troubleshooting

**Build fails on Vercel?**
- Check the build logs in Vercel dashboard → Deployments → click the failed deploy
- Common fix: make sure all environment variables are set

**SQLite error on Vercel?**
- SQLite works for demo/testing but is read-only on Vercel's serverless functions
- For persistent data, switch to PostgreSQL (see Step 6)

**API routes not working?**
- Check that environment variables are set in Vercel
- API routes work at `/api/cards`, `/api/listings`, etc.

**Need to update after changes?**
- Just push to GitHub — Vercel auto-deploys on every push to `main`
```bash
git add .
git commit -m "Your changes"
git push
```
