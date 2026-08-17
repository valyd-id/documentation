#!/usr/bin/env bash
# Option A cutover: point the canonical docs.valyd.work host at the Nextra docs
# (pm2 "docs-nextra" on 127.0.0.1:4100) and retire the old Vite SPA that served it.
#
# Safe to re-run. The docs.valyd.work TLS cert already exists, so NO certbot run.
# Run as root:  cd /var/www/pollus_main_servers/docs-nextra && sudo deploy/go-live-docs.sh
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
DOMAIN=docs.valyd.work

# 0) Prereqs the script relies on (fail loud if missing).
[ -d /etc/letsencrypt/live/$DOMAIN ] || { echo "!! No TLS cert at /etc/letsencrypt/live/$DOMAIN — run certbot for $DOMAIN first."; exit 1; }
curl -sf http://127.0.0.1:4100/ >/dev/null || { echo "!! Nextra app is not answering on 127.0.0.1:4100 — start pm2 app 'docs-nextra' first."; exit 1; }

echo "==> Installing nginx site for $DOMAIN (proxy → 127.0.0.1:4100)"
install -m 644 "$HERE/$DOMAIN.nginx.conf" "/etc/nginx/sites-available/$DOMAIN"
ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"

# 1) Retire the OLD vhost that was serving docs.valyd.work from the Vite SPA
#    (file is named docs.pollus.tech but its server_name is docs.valyd.work).
if [ -L /etc/nginx/sites-enabled/docs.pollus.tech ]; then
  echo "==> Disabling old docs vhost (docs.pollus.tech → docs/dist SPA)"
  rm -f /etc/nginx/sites-enabled/docs.pollus.tech
fi

# 2) Optional: drop the interim docs-nextra.valyd.work host now that the canonical
#    host is live. Comment this out if you want to keep it as an alias.
if [ -L /etc/nginx/sites-enabled/docs-nextra.valyd.work ]; then
  echo "==> Removing interim docs-nextra.valyd.work vhost"
  rm -f /etc/nginx/sites-enabled/docs-nextra.valyd.work
fi

nginx -t
systemctl reload nginx

echo "==> Done. Verifying https://$DOMAIN/ :"
curl -sI "https://$DOMAIN/" | head -3
echo "==> Agent corpus check:"
curl -sI "https://$DOMAIN/llms.txt" | head -1
