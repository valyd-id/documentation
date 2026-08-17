# Docs CI/CD

Push a branch → it deploys to the matching environment (VC-style: one SSH key, hosts in the workflow).

| Branch        | Environment  | Docs host           |
|---------------|--------------|---------------------|
| `development` | dev          | `docs.valyd.work`   |
| `staging`     | staging      | `docs.valyd.vip`    |
| `main`        | production   | `docs.valyd.id`     |

Pipeline: `.github/workflows/deploy-docs.yml` → per-branch job → SSH to that env's box →
`deploy/deploy.sh` (fetched from the branch): `git reset --hard`, derive the env's hosts from
`DOCS_HOST`, `rm -rf .next`, `npm ci && npm run build` (prebuild regenerates the env-correct
llms/`.md`/OpenAPI), `pm2 restart`.

## The ONLY GitHub secret you need
Repo → Settings → Secrets and variables → **Actions** → New repository secret:
- `DEPLOY_SSH_KEY` = the private deploy key (its public key is in each box's `~/.ssh/authorized_keys`).

That's it — no per-environment secrets. Hosts, paths, and the env's URLs live in the workflow file
(and `deploy.sh` derives idp/dev hosts from the docs host's TLD).

## Fill in the boxes (workflow file)
`development` is already set (dev box `96.250.208.62`, user `javi`). Edit `deploy-docs.yml` and set:
- **staging** job: `host` / `username` for the `.vip` box (add `proxy_*` bastion lines if it's estate-internal).
- **production** job: `host` / `username` for the `.id` box (the prod IdP box is estate-internal → uncomment the `proxy_*` bastion lines, bastion = `96.250.208.62` / `javi`).
Adjust `DOCS_PATH` in each if the checkout path differs on that box.

## One-time box provisioning (per env, before the first CI run)
CI updates an existing checkout; it doesn't create one. On each box, once:

```bash
cd /var/www/pollus_main_servers
git clone -b <development|staging|main> git@github.com:valyd-id/docs.pollus.tech.git docs-nextra
cd docs-nextra
printf 'OPENROUTER_API_KEY=%s\n' "<key>" > .env.secrets   # kept out of git; deploy.sh appends it
npm ci && npm run build
pm2 start npm --name docs-nextra -- start
pm2 save
```
Then add the nginx vhost for that env's docs host → the pm2 port, and issue the TLS cert.
The **old docs stay untouched** — this only adds the nextra app.

## Notes
- `deploy.sh` does `git reset --hard origin/<branch>` and `rm -rf .next` — the box always matches the
  branch exactly and never serves a stale-env build.
- The OpenRouter (Ask AI) key lives in `.env.secrets` on each box, never in git or CI.
- Manual redeploy: Actions tab → "Deploy docs" → Run workflow on the branch.
