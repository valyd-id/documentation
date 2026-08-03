#!/usr/bin/env bash
# One-shot go-live for docs-nextra.valyd.work. Run as root: sudo deploy/go-live.sh
# Prereqs (already done by the agent): production build in .next/, pm2 app
# "docs-nextra" serving 127.0.0.1:4100, DNS A record → this box.
set -euo pipefail

DOMAIN=docs-nextra.valyd.work
HERE="$(cd "$(dirname "$0")" && pwd)"

echo "==> Installing nginx site for $DOMAIN"
install -m 644 "$HERE/$DOMAIN.nginx.conf" "/etc/nginx/sites-available/$DOMAIN"
ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"

nginx -t
systemctl reload nginx
echo "==> HTTP vhost live"

echo "==> Requesting Let's Encrypt certificate"
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --redirect \
  $( [ -d /etc/letsencrypt/accounts ] || echo "--register-unsafely-without-email" )

nginx -t
systemctl reload nginx

echo "==> Done. Verifying:"
curl -sI "https://$DOMAIN/" | head -3
