# G-mall Portal (NestJS + Next.js)

Stack for storefront + admin domains: **customers, contracts, products, auth, cart, addresses, orders, Tap**.

## Structure

| Path | Role |
|------|------|
| `apps/api` | NestJS REST API + Prisma + PostgreSQL |
| `apps/portal` | Next.js UI — admin console + customer account |
| `mobileapp/` | React Native customer app |

## Quick start

```bash
# 1) Database
cd apps/api
docker compose up -d
cp .env.example .env   # if needed

# 2) Schema + seed
npx prisma db push
npm run prisma:seed

# 3) API (port 3001)
npm run start:dev

# 4) Portal (port 3002) — new terminal
cd ../portal
cp .env.example .env.local
npm run dev -- --port 3002
```

Open http://localhost:3002

### Demo users

| Role | Email / Mobile | Password |
|------|----------------|----------|
| Admin | `admin@gmall.sa` | `Admin123!` |
| Customer (portal) | `customer@gmall.sa` | `Customer123!` |
| Vendor | `vendor@gmall.sa` | `Vendor123!` |

## Deploy

See [DEPLOY.md](./DEPLOY.md) for Docker production setup.

## Mobile app

Point `BASE_URL` at Nest (see `mobileapp/docs/PORTAL_API.md`):

```env
BASE_URL=http://localhost:3001/api
```

Mobile-compatible routes include `/auth/login`, `/register`, `/getCustomer`, `/getProducts`, `/cart`, `/address`, `/order`, `/payment_url`, etc. JWT is returned as `session_id`.

## Notes

- Configure Tap keys in `apps/api/.env` (`TAP_SANDBOX_SECRET_KEY`, `PUBLIC_API_URL`).
