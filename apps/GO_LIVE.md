# G-Mall go-live runbook

Use this on the **production VPS** after removing Odoo.  
Code on `main` is ready — this document is the **only** critical path to a public launch.

## Day-of checklist

- [ ] Odoo / old stack stopped and removed from the VPS
- [ ] Docker + Compose v2 installed
- [ ] DNS A records ready (or set before HTTPS step)
- [ ] Tap sandbox keys available (live keys only after sandbox QA)
- [ ] `git pull` on `main`
- [ ] `.env.production` filled (not placeholders)
- [ ] `./scripts/preflight-prod.sh` passes
- [ ] `./scripts/deploy-prod.sh` + health + smoke pass
- [ ] HTTPS via `setup-nginx-ssl.sh`
- [ ] Demo passwords changed
- [ ] Mobile `.env.production` points at production API
- [ ] Signing + device QA + store assets (after server is stable)

## 1. Server prep

```bash
# Docker + Compose v2 required
git clone https://github.com/Gate-Mall/gmall-app.git
cd gmall-app
git checkout main
git pull origin main
```

If the repo already exists:

```bash
cd gmall-app
git fetch origin
git checkout main
git pull origin main
```

Stop legacy Odoo containers if still running (names vary):

```bash
docker ps --format '{{.Names}}' | grep -i odoo || true
# docker stop <odoo-container> && docker rm <odoo-container>
```

## 2. Environment

```bash
cd apps
cp .env.production.example .env.production
nano .env.production
```

Required:

| Variable | Example |
|----------|---------|
| `POSTGRES_PASSWORD` | strong random |
| `JWT_SECRET` | 32+ random chars |
| `PUBLIC_API_URL` | `https://api.gmall.sa` |
| `NEXT_PUBLIC_API_URL` | `https://api.gmall.sa` |
| `CORS_ORIGIN` | `https://portal.gmall.sa,https://gmall.sa` |
| `TAP_*` | sandbox first, then live |
| `SEED_DB` | `true` once, then `false` |
| `FCM_SERVER_KEY` | optional until push is enabled |

Generate secrets quickly:

```bash
openssl rand -base64 32   # POSTGRES_PASSWORD or JWT_SECRET
```

## 3. Preflight + deploy + health

```bash
chmod +x scripts/*.sh
./scripts/preflight-prod.sh
./scripts/deploy-prod.sh
./scripts/health-check.sh
./scripts/smoke-multi-vendor.sh
```

Skip preflight only if you already validated env: `SKIP_PREFLIGHT=1 ./scripts/deploy-prod.sh`

## 4. DNS + HTTPS

Point A records:

- `api.gmall.sa` → VPS IP  
- `portal.gmall.sa` → VPS IP  

```bash
sudo LETSENCRYPT_EMAIL=you@gmall.sa ./scripts/setup-nginx-ssl.sh
```

API/portal containers bind to `127.0.0.1` only; nginx terminates TLS publicly.

## 5. Tap

Dashboard webhooks:

- `POST https://api.gmall.sa/api/payment/tap/webhook`
- Return URL uses API return route for orders

Order:

1. Keep `TAP_USE_SANDBOX=true` with sandbox secret
2. Place a small sandbox payment from the app
3. Confirm webhook marks order **PAID**
4. Then set live keys and `TAP_USE_SANDBOX=false`
5. Redeploy / recreate API container so env is picked up

## 6. Multi-vendor smoke (manual)

After seed (or with real vendors):

1. Mobile: add products from **two** vendors to cart → checkout
2. Confirm parent + child orders in admin
3. Vendor portal `/vendor/orders`: accept → ship
4. Customer: tracking updates in the app
5. Optional: request return + open dispute from order details

## 7. Mobile production env

```env
# mobileapp/.env.production
BASE_URL=https://api.gmall.sa/api
TAP_PRODUCTION_SECRET_KEY=sk_live_...
TAP_MERCHANT_ID=...
```

Then:

1. Signing — [`mobileapp/docs/RELEASE_SIGNING.md`](../mobileapp/docs/RELEASE_SIGNING.md)
2. Device QA — [`mobileapp/docs/RELEASE_QA.md`](../mobileapp/docs/RELEASE_QA.md)
3. Store assets — [`mobileapp/docs/STORE_SUBMISSION.md`](../mobileapp/docs/STORE_SUBMISSION.md)

## 8. Security before public traffic

- Change demo passwords (`admin@gmall.sa`, customer `0500000000`, `vendor@gmall.sa`)
- Confirm privacy URL: `https://portal.gmall.sa/privacy`
- Confirm uploads persist (docker volume `gmall_uploads`)
- Set `SEED_DB=false` for all future deploys

## Demo accounts (seed only)

| Role | Login | Password |
|------|-------|----------|
| Admin | admin@gmall.sa | Admin123! |
| Customer | 0500000000 | Customer123! |
| Vendor | vendor@gmall.sa | Vendor123! |

## Message for the client (WhatsApp / email)

```
جاهزين للنشر على السيرفر. المطلوب من جهتكم:
1) وصول SSH للـ VPS + حذف Odoo إن وُجد
2) DNS: api.gmall.sa و portal.gmall.sa → IP السيرفر
3) مفاتيح Tap (sandbox أولاً)
4) جلسة ساعة تقريباً: سحب main → تعبئة .env → deploy-prod → HTTPS

بعدها نختبر الدفع والتطبيق على أجهزة حقيقية ثم التوقيع والمتاجر.
الدليل: apps/GO_LIVE.md على GitHub (branch main).
```

## Troubleshooting

| Symptom | Check |
|---------|--------|
| Preflight fails on secrets | Edit `.env.production` — no `change-me` values |
| API health timeout | `docker compose --env-file .env.production -f docker-compose.prod.yml logs api` |
| Portal 502 | API healthy? nginx upstream `127.0.0.1:3002`? |
| Certbot DNS failure | A records must point to this VPS first |
| Tap stays unpaid | Webhook URL + sandbox vs live key mismatch |
| No push | Set `FCM_SERVER_KEY` and recreate API container |
