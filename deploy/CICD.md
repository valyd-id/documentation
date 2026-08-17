# Docs CI/CD

Push a branch → it deploys to the matching environment.

| Branch        | Environment  | Hosts (`*.valyd.…`) |
|---------------|--------------|---------------------|
| `development` | dev          | `.work`             |
| `staging`     | staging      | `.vip`              |
| `main`        | production   | `.id`               |

The pipeline is `.github/workflows/deploy-docs.yml` → SSH to the box → `deploy/deploy.sh`
(pull the branch, write the env's hosts into `.env`, `npm ci`, `npm run build`, `pm2 restart`).
The build's `prebuild` regenerates the env-correct llms.txt / `.md` mirrors / OpenAPI, so every
environment serves host-correct docs from the same source.

## One-time GitHub setup (repo: valyd-id/docs.pollus.tech)

Create three **Environments** (Settings → Environments): `dev`, `staging`, `production`.

For each, add:

**Secrets** (how CI reaches the box):
- `SSH_HOST` — box hostname/IP
- `SSH_USER` — deploy user
- `SSH_KEY` — that user's SSH **private** key (add the matching public key to the box's `~/.ssh/authorized_keys`)
- `SSH_PORT` — optional (staging box uses `2222`)

**Variables** (per-env config):
- `DOCS_PATH` — checkout path on the box (e.g. `/var/www/pollus_main_servers/docs-nextra`)
- `PM2_APP` — pm2 app name (e.g. `docs-nextra`)
- `NEXT_PUBLIC_DOCS_URL` / `NEXT_PUBLIC_IDP_URL` / `NEXT_PUBLIC_DEV_URL` — that env's hosts:
  - dev → `https://docs.valyd.work` / `https://idp.valyd.work` / `https://dev.valyd.work`
  - staging → `…valyd.vip`
  - production → `…valyd.id`

## One-time box provisioning (per environment, before the first CI run)

CI updates an existing checkout; it does not create one. On each box, once:

```bash
cd /var/www/pollus_main_servers
git clone -b <development|staging|main> git@github.com:valyd-id/docs.pollus.tech.git docs-nextra
cd docs-nextra
# keep the chat key OUT of git; deploy.sh appends this to .env each build:
printf 'OPENROUTER_API_KEY=%s\n' "<key>" > .env.secrets
npm ci && npm run build
pm2 start npm --name docs-nextra -- start   # serves 127.0.0.1:3000 (or your PORT)
pm2 save
```

Then add the nginx vhost for that env's docs host → the pm2 port, and issue the TLS cert.
The **old docs stay untouched** — this only adds the nextra app + its own vhost.

## Notes
- `deploy.sh` does `git reset --hard origin/<branch>` — the box always matches the branch exactly.
- Secrets (OpenRouter key) live in `.env.secrets` on each box, never in git or CI.
- Manual redeploy: Actions tab → "Deploy docs" → Run workflow on the branch.
