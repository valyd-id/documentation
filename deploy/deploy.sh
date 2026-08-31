#!/usr/bin/env bash
set -euo pipefail
# On-box deploy for the Nextra docs. Called by CI (GitHub Actions) over SSH, or
# by hand. Pulls the branch, installs, builds with the environment's hosts, and
# restarts the pm2 app. Idempotent and safe to re-run.
#
# Required env (the workflow exports these per branch; export them yourself for
# a manual run):
#   DOCS_BRANCH   git branch to deploy (development | staging | main)
#   DOCS_PATH     absolute path to the checkout on this box
#   PM2_APP       pm2 app name (e.g. docs-nextra)
#   DOCS_HOST     this env's docs URL (e.g. https://docs.valyd.vip)
#
# All four NEXT_PUBLIC_* hosts are DERIVED from DOCS_HOST's TLD (work/vip/id):
#   docs.valyd.<tld> / idp.valyd.<tld> / dev.valyd.<tld> / mcp.valyd.<tld>
# Set NEXT_PUBLIC_* explicitly to override the derivation.
set -euo pipefail

: "${DOCS_BRANCH:?set DOCS_BRANCH}"
: "${DOCS_PATH:?set DOCS_PATH}"
: "${PM2_APP:?set PM2_APP}"
: "${DOCS_HOST:?set DOCS_HOST (e.g. https://docs.valyd.work)}"

# Derive the environment's hosts from the docs host's TLD (…valyd.work|vip|id).
TLD="${DOCS_HOST##*valyd.}"; TLD="${TLD%%/*}"
: "${NEXT_PUBLIC_DOCS_URL:=$DOCS_HOST}"
: "${NEXT_PUBLIC_IDP_URL:=https://idp.valyd.$TLD}"
: "${NEXT_PUBLIC_DEV_URL:=https://dev.valyd.$TLD}"
: "${NEXT_PUBLIC_MCP_URL:=https://mcp.valyd.$TLD}"
export NEXT_PUBLIC_DOCS_URL NEXT_PUBLIC_IDP_URL NEXT_PUBLIC_DEV_URL NEXT_PUBLIC_MCP_URL

cd "$DOCS_PATH"

echo "==> Fetching $DOCS_BRANCH"
git fetch --prune origin
git checkout "$DOCS_BRANCH"
git reset --hard "origin/$DOCS_BRANCH"   # deploy exactly what's on the branch

# Write the per-environment hosts so the build (gen-corpus + remark + sitemap)
# targets THIS env. Falls back to the .work defaults if a var is unset.
cat > .env <<EOF
NEXT_PUBLIC_DOCS_URL=${NEXT_PUBLIC_DOCS_URL:-https://docs.valyd.work}
NEXT_PUBLIC_IDP_URL=${NEXT_PUBLIC_IDP_URL:-https://idp.valyd.work}
NEXT_PUBLIC_DEV_URL=${NEXT_PUBLIC_DEV_URL:-https://dev.valyd.work}
NEXT_PUBLIC_MCP_URL=${NEXT_PUBLIC_MCP_URL:-https://mcp.valyd.work}
EOF
# Preserve any secret-bearing lines (e.g. OPENROUTER_API_KEY) from a sidecar file
# the box keeps out of git, so CI never has to hold the chat key.
[ -f .env.secrets ] && cat .env.secrets >> .env || true

echo "==> Installing dependencies"
npm ci --no-audit --no-fund

echo "==> Building (prebuild regenerates the env-correct corpus)"
# Clear the Next cache: the host substitution (remark-hosts) reads env at compile
# time and is NOT part of Next's cache key, so a stale-env build could otherwise
# be reused. A clean build guarantees the pages match THIS env's hosts.
rm -rf .next
npm run build

echo "==> Gates: contract + links (fail the deploy on drift)"
npm run check-links

echo "==> Restarting pm2 app '$PM2_APP'"
if pm2 describe "$PM2_APP" >/dev/null 2>&1; then
  pm2 restart "$PM2_APP" --update-env
else
  pm2 start npm --name "$PM2_APP" -- start
  pm2 save
fi

echo "==> Deployed $DOCS_BRANCH to $PM2_APP"
