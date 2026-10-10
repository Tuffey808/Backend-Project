#!/usr/bin/env bash
# Install nginx site + Let's Encrypt certs for G-mall (run as root on VPS)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONF_SRC="${ROOT}/nginx/gmall.conf"
SITE_NAME="${SITE_NAME:-gmall}"
API_DOMAIN="${API_DOMAIN:-api.gmall.sa}"
PORTAL_DOMAIN="${PORTAL_DOMAIN:-portal.gmall.sa}"
EMAIL="${LETSENCRYPT_EMAIL:-}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root (sudo)."
  exit 1
fi

if [[ ! -f "$CONF_SRC" ]]; then
  echo "Missing nginx config: $CONF_SRC"
  exit 1
fi

if ! command -v nginx >/dev/null 2>&1; then
  echo "Installing nginx..."
  apt-get update -y && apt-get install -y nginx
fi

if ! command -v certbot >/dev/null 2>&1; then
  echo "Installing certbot..."
  apt-get install -y certbot python3-certbot-nginx
fi

TMP="$(mktemp)"
sed "s/api\.gmall\.sa/${API_DOMAIN}/g; s/portal\.gmall\.sa/${PORTAL_DOMAIN}/g" "$CONF_SRC" >"$TMP"

# Temporary HTTP-only site so certbot can validate
cat >"/etc/nginx/sites-available/${SITE_NAME}" <<EOF
server {
  listen 80;
  server_name ${API_DOMAIN} ${PORTAL_DOMAIN};
  location / { return 200 'gmall-acme-ready'; add_header Content-Type text/plain; }
}
EOF
ln -sfn "/etc/nginx/sites-available/${SITE_NAME}" "/etc/nginx/sites-enabled/${SITE_NAME}"
nginx -t && systemctl reload nginx

CERTBOT_ARGS=(-d "$API_DOMAIN" -d "$PORTAL_DOMAIN" --nginx --non-interactive --agree-tos)
if [[ -n "$EMAIL" ]]; then
  CERTBOT_ARGS+=(--email "$EMAIL")
else
  CERTBOT_ARGS+=(--register-unsafely-without-email)
fi

echo "==> Requesting certificates..."
certbot "${CERTBOT_ARGS[@]}"

cp "$TMP" "/etc/nginx/sites-available/${SITE_NAME}"
rm -f "$TMP"
nginx -t && systemctl reload nginx

echo ""
echo "HTTPS ready for ${API_DOMAIN} and ${PORTAL_DOMAIN}."
echo "Ensure docker compose published 3001/3002 on 127.0.0.1 only (see docker-compose.prod.yml)."
