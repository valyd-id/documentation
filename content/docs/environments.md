# Environments & credentials

Valyd runs the same product on independent environments. **These docs describe the development
environment (`*.valyd.work`).** Each environment has its own hosts, its own Developer Portal, and
its own credentials — an app you register in one environment does not exist in another.

## Hosts per environment

Every environment exposes the same three hosts under a different domain:

| Role | Development | What it is |
| --- | --- | --- |
| **API** (`idp`) | `https://idp.valyd.work` | The Valyd API your app calls — verification, the account APIs, and sign-in (OAuth 2.0 / OIDC). |
| **Developer Portal** (`dev`) | `https://dev.valyd.work` | Where a human creates apps, gets keys, and composes verification workflows. No API automates app creation. |
| **Docs** (`docs`) | `https://docs.valyd.work` | These docs, the [API Playground](/sandbox), and the live demos. |

The production and testing environments mirror this layout on their own domains. Point your
integration at the API host for the environment you registered your app in, and never mix a key
from one environment with the host of another.

## Where each credential comes from

You get every credential from the [Developer Portal](https://dev.valyd.work) for the matching
environment — see [Create an app](/docs/create-project) for the full walkthrough. Which ones you
need depends on your integration:

| Credential | Format | Issued for | Used as |
| --- | --- | --- | --- |
| Client ID | `9357c59b…` | Connect with Valyd (OAuth 2.0 / OIDC) | `client_id` in the authorize + token requests |
| Client Secret | `sk_live_…` (shown once) | Connect with Valyd | `client_secret` in the server-side token exchange |
| App API key | `vrf_…` (shown once) | Verification API | the `X-API-Key` header on every verification call |
| Webhook signing secret | `whsec_…` | Verification sessions | verifying the HMAC signature on incoming webhooks |
| Workflow ID | `wf_…` | Verification sessions | the `workflow_id` you pass when creating a session |

Connect with Valyd integrations hold the `client_id` + `client_secret`; verification integrations
hold the App API key (plus a workflow ID and webhook secret for verification sessions). The two
credential families are independent — the App API key never authenticates Connect, and
`client_secret` never authenticates verification calls.

## Environment variables used across the quickstarts

The [quickstarts](/docs/quickstarts) and SDK read these from your server environment. Keep them
per-environment (a separate `.env` for dev vs production) and never expose a secret in frontend
code:

```bash
# .env (server-side only)
VALYD_IDP_URL=https://idp.valyd.work      # the API host for THIS environment

# Connect with Valyd (OAuth 2.0 / OIDC)
VALYD_CLIENT_ID=9357c59bc1794b4c9efe8823e5878147
VALYD_CLIENT_SECRET=sk_live_a1b2c3d4e5f6g7h8i9j0...
VALYD_REDIRECT_URI=https://yourapp.com/callback   # exact registered callback, no trailing slash

# Verification API (independent of the two OIDC values above)
VALYD_API_KEY=vrf_...
VALYD_WEBHOOK_SECRET=whsec_...            # verification sessions only
VALYD_WORKFLOW_ID=wf_...                  # verification sessions only
```

Setting `VALYD_IDP_URL` per environment is how the same code deploys everywhere: change the host,
supply that environment's credentials, and nothing else moves.

## Separate test and production apps

Even inside one environment, create **separate apps** (for example "Test" and "Production") so each
has its own `client_id` / `client_secret`, App API key, workflows, and webhook endpoint. You can
rotate or revoke the test app's key without touching production. See [Testing](/docs/testing) for
how verification runs for real against your wallet, and the one-time credit every new account
starts with.

## Related

- [Apps & API keys](/docs/create-project) — the portal walkthrough.
- [Testing your integration](/docs/testing) — real checks, the welcome credit, and webhook testing.
- [API key lifecycle](/docs/api-key-lifecycle) — rotating and revoking the App API key.
