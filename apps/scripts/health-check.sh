#!/usr/bin/env bash
# Smoke-test production stack
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

echo "API:    $API_URL"
echo "Portal: $PORTAL_URL"
echo ""

curl -sf "$API_URL/api/health" | head -c 200
echo ""
echo "✓ /api/health"

curl -sf -X POST "$API_URL/api/getProducts" -H 'Content-Type: application/json' -d '{}' | head -c 120
echo ""
echo "✓ POST /api/getProducts"

curl -sf "$API_URL/api/vendors" | head -c 120
echo ""
echo "✓ GET /api/vendors"

curl -sf -o /dev/null -w "Portal HTTP %{http_code}\n" "$PORTAL_URL/"
echo "✓ Portal home"

echo ""
echo "All checks passed. Optional: ./scripts/smoke-multi-vendor.sh"
