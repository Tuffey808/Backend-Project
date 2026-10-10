# Deploying G-mall (Production)

Stack: **Nest API** + **Next.js portal** + **PostgreSQL** + persistent **uploads**.

## Quick deploy (VPS / cloud server)

### 1. Prerequisites

- Docker + Docker Compose v2
- Domain DNS: `api.gmall.sa`, `portal.gmall.sa` (or your domains)
- Tap Payments account (sandbox → live)
- Apple Developer + Google Play (for mobile store)

### 2. Configure environment

```bash
cd apps
cp .env.production.example .env.production
# Edit: POSTGRES_PASSWORD, JWT_SECRET, PUBLIC_API_URL, TAP keys, CORS_ORIGIN
```

| Variable | Production example |
|----------|-------------------|
| `POSTGRES_PASSWORD` | strong random password |
| `JWT_SECRET` | 32+ random chars |
| `PUBLIC_API_URL` | `https://api.gmall.sa` |
| `NEXT_PUBLIC_API_URL` | `https://api.gmall.sa` |
| `CORS_ORIGIN` | `https://portal.gmall.sa,https://gmall.sa` |
| `TAP_USE_SANDBOX` | `false` when going live |
| `SEED_DB` | `true` once for demo data, then `false` |

### 3. Deploy

Full day-of runbook: [`GO_LIVE.md`](./GO_LIVE.md)

```bash
chmod +x scripts/*.sh
./scripts/preflight-prod.sh
./scripts/deploy-prod.sh
./scripts/health-check.sh
./scripts/smoke-multi-vendor.sh
```

### 4. HTTPS (nginx)

```bash
sudo LETSENCRYPT_EMAIL=you@gmall.sa ./scripts/setup-nginx-ssl.sh
# or manually copy nginx/gmall.conf + certbot
```

Full checklist: [GO_LIVE.md](GO_LIVE.md).

Tap webhooks (live):

- Webhook: `POST https://api.gmall.sa/api/payment/tap/webhook`
- Return: `GET https://api.gmall.sa/api/payment/tap/return/order/:orderId`

### 5. Mobile app production

In `mobileapp/.env.production`:

```env
BASE_URL=https://api.gmall.sa/api
TAP_PRODUCTION_SECRET_KEY=sk_live_...
TAP_MERCHANT_ID=...
```

Then:

```bash
cd mobileapp
chmod +x scripts/pre-release-check.sh
./scripts/pre-release-check.sh
```

See `mobileapp/docs/RELEASE_SIGNING.md`, `RELEASE_QA.md`, `STORE_SUBMISSION.md`.

### 6. Privacy policy URL (App Store required)

After portal deploy: **https://portal.gmall.sa/privacy**

---

## Local development

```bash
cd apps/api && docker compose up -d && npx prisma db push && npm run prisma:seed && npm run start:dev
cd apps/portal && npm run dev -- --port 3002
```

## Health & smoke tests

```bash
curl https://api.gmall.sa/api/health
curl -X POST https://api.gmall.sa/api/getProducts -H 'Content-Type: application/json' -d '{}'
```

## Demo accounts (after seed)

| Role | Login | Password |
|------|-------|----------|
| Admin | admin@gmall.sa | Admin123! |
| Customer | customer@gmall.sa / 0500000000 | Customer123! |
| Vendor | vendor@gmall.sa | Vendor123! |
| Promo | WELCOME10 | 10% off |

**Change demo passwords before public launch.**

## Admin ↔ Mobile

Both use the same API + database. Products, categories, coupons, and orders managed in admin appear in the mobile app automatically.
