#!/usr/bin/env bash
# Validate production env + host prerequisites before deploy-prod.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-.env.production}"
API_DOMAIN="${API_DOMAIN:-api.gmall.sa}"
PORTAL_DOMAIN="${PORTAL_DOMAIN:-portal.gmall.sa}"
fail=0

ok() { echo "✓ $1"; }
warn() { echo "! $1"; }
bad() { echo "✗ $1"; fail=1; }

echo "G-mall production preflight"
echo "Env file: $ENV_FILE"
echo ""

if [[ ! -f "$ENV_FILE" ]]; then
  bad "Missing $ENV_FILE — copy from .env.production.example"
  exit 1
fi

# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a

for var in POSTGRES_PASSWORD JWT_SECRET PUBLIC_API_URL NEXT_PUBLIC_API_URL CORS_ORIGIN; do
  val="${!var:-}"
  if [[ -z "$val" ]] || [[ "$val" == change-me* ]]; then
    bad "$var is unset or still a placeholder"
  else
    ok "$var set"
  fi
done

if [[ "${#JWT_SECRET}" -lt 32 ]]; then
  bad "JWT_SECRET should be at least 32 characters"
else
  ok "JWT_SECRET length OK"
fi

if [[ "${TAP_USE_SANDBOX:-true}" == "true" ]]; then
  if [[ -z "${TAP_SANDBOX_SECRET_KEY:-}" ]]; then
    warn "TAP_SANDBOX_SECRET_KEY empty (OK for infra-only deploy; required for payment QA)"
  else
    ok "Tap sandbox key present"
  fi
else
  if [[ -z "${TAP_PRODUCTION_SECRET_KEY:-}" || -z "${TAP_MERCHANT_ID:-}" ]]; then
    bad "Live Tap mode requires TAP_PRODUCTION_SECRET_KEY and TAP_MERCHANT_ID"
  else
    ok "Tap live keys present"
  fi
fi

if [[ -z "${FCM_SERVER_KEY:-}" ]]; then
  warn "FCM_SERVER_KEY empty — push tokens store but will not deliver"
else
  ok "FCM_SERVER_KEY present"
fi

if [[ "${SEED_DB:-false}" == "true" ]]; then
  warn "SEED_DB=true — demo accounts will be seeded; set false after first deploy"
else
  ok "SEED_DB=false"
fi

if command -v docker >/dev/null 2>&1; then
  ok "docker installed"
else
  bad "docker not found"
fi

if docker compose version >/dev/null 2>&1; then
  ok "docker compose v2 available"
else
  bad "docker compose v2 required"
fi

if command -v curl >/dev/null 2>&1; then
  ok "curl available"
else
  bad "curl required for health checks"
fi

if command -v dig >/dev/null 2>&1; then
  api_ip="$(dig +short "$API_DOMAIN" A | head -1 || true)"
  portal_ip="$(dig +short "$PORTAL_DOMAIN" A | head -1 || true)"
  if [[ -n "$api_ip" ]]; then
    ok "$API_DOMAIN → $api_ip"
  else
    warn "$API_DOMAIN has no A record yet (set DNS before HTTPS)"
  fi
  if [[ -n "$portal_ip" ]]; then
    ok "$PORTAL_DOMAIN → $portal_ip"
  else
    warn "$PORTAL_DOMAIN has no A record yet (set DNS before HTTPS)"
  fi
else
  warn "dig not installed — skip DNS check"
fi

echo ""
if [[ "$fail" -ne 0 ]]; then
  echo "Preflight failed. Fix the ✗ items, then re-run."
  exit 1
fi

echo "Preflight passed. Next: ./scripts/deploy-prod.sh"
