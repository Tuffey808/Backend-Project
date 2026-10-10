#!/usr/bin/env bash
# Deploy G-mall production stack (API + Portal + PostgreSQL)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE="docker compose --env-file ${ENV_FILE} -f docker-compose.prod.yml"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing ${ENV_FILE}. Copy from .env.production.example and fill secrets."
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

for var in POSTGRES_PASSWORD JWT_SECRET PUBLIC_API_URL NEXT_PUBLIC_API_URL; do
  if [[ -z "${!var:-}" ]] || [[ "${!var}" == change-me* ]]; then
    echo "Set ${var} in ${ENV_FILE} before deploying."
    exit 1
  fi
done

if [[ "${SKIP_PREFLIGHT:-}" != "1" ]]; then
  echo "==> Preflight..."
  bash "$(dirname "$0")/preflight-prod.sh"
fi

echo "==> Building and starting containers..."
$COMPOSE up -d --build

echo "==> Waiting for API health..."
for i in $(seq 1 45); do
  if curl -sf "${PUBLIC_API_URL}/api/health" >/dev/null 2>&1 || curl -sf "http://127.0.0.1:3001/api/health" >/dev/null 2>&1; then
    echo "API is healthy."
    break
  fi
  sleep 2
  if [[ "$i" -eq 45 ]]; then
    echo "API health check timed out. Run: $COMPOSE logs api"
    exit 1
  fi
done

echo "==> Applying Prisma migrations inside API container (if present)..."
$COMPOSE exec -T api npx prisma migrate deploy 2>/dev/null \
  || $COMPOSE exec -T api npx prisma db push 2>/dev/null \
  || echo "(skip) migrate/push — entrypoint may already have applied schema"

if [[ "${SEED_DB:-false}" == "true" ]]; then
  echo "==> Seeding database..."
  $COMPOSE exec -T api npx prisma db seed 2>/dev/null \
    || (
      export DATABASE_URL="postgresql://gmall:${POSTGRES_PASSWORD}@127.0.0.1:5432/gmall_portal?schema=public"
      (cd api && npx prisma db seed)
    )
  echo "Seed complete. Set SEED_DB=false for future deploys."
fi

echo ""
echo "Deployed. Next steps:"
echo "  1. DNS A records: api + portal → this server"
echo "  2. HTTPS: sudo ./scripts/setup-nginx-ssl.sh"
echo "  3. Tap webhook → ${PUBLIC_API_URL}/api/payment/tap/webhook"
echo "  4. mobileapp/.env.production BASE_URL=${PUBLIC_API_URL}/api"
echo "  5. ./scripts/health-check.sh && ./scripts/smoke-multi-vendor.sh"
echo "  6. Change demo passwords before public launch"
