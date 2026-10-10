#!/usr/bin/env bash
# Extended smoke tests for multi-vendor production readiness
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-.env.production}"
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

API_URL="${PUBLIC_API_URL:-http://127.0.0.1:3001}"
PORTAL_URL="${PORTAL_URL:-http://127.0.0.1:3002}"

fail=0
check() {
  local name="$1"
  shift
  if "$@"; then
    echo "✓ $name"
  else
    echo "✗ $name"
    fail=1
  fi
}

echo "Multi-vendor smoke against $API_URL"
echo ""

check "health" curl -sf -o /dev/null "$API_URL/api/health"
check "products" curl -sf -o /dev/null -X POST "$API_URL/api/getProducts" -H 'Content-Type: application/json' -d '{}'
check "vendors list" curl -sf -o /dev/null "$API_URL/api/vendors"
check "portal home" curl -sf -o /dev/null "$PORTAL_URL/"

# Optional authenticated checks if ADMIN_TOKEN provided
if [[ -n "${ADMIN_TOKEN:-}" ]]; then
  check "admin finance" curl -sf "$API_URL/api/admin/finance" -H "Authorization: Bearer $ADMIN_TOKEN" >/dev/null
  check "admin orders" curl -sf "$API_URL/api/admin/orders" -H "Authorization: Bearer $ADMIN_TOKEN" >/dev/null
fi

echo ""
if [[ "$fail" -eq 0 ]]; then
  echo "All multi-vendor smoke checks passed."
else
  echo "Some checks failed."
  exit 1
fi
