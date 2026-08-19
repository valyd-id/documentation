# SDKs & tools

Everything here is real and maintained — no empty language tabs. For stacks without an SDK, use
the [raw API quickstarts](/docs/quickstarts) or point [your own OIDC library](/docs/oidc) at the
discovery document.

## @valyd/sdk — Node.js (official)

The one package for both products: `valyd.auth` (Login with Valyd — OIDC transaction, PKCE,
verified ID tokens) and `valyd.verify` (verification sessions, checks, webhooks).

```bash
npm install @valyd/sdk@^1.10.1
```

- [Node quickstart](/docs/quickstart/node) · [SDK guide](/verifications/sdk) · npm: `@valyd/sdk`
- Server-side only — the client secret and API key never belong in a browser.

## Sign-in button (browser)

A two-line drop-in "Sign in with Valyd" button — generates `state`/`nonce`, sets first-party
cookies, and starts the standard flow. Environment follows the script host.

```html
<script src="https://idp.valyd.work/signin/client.js" async></script>
<div class="valyd-signin" data-client-id="YOUR_CLIENT_ID"
     data-redirect-uri="https://yourapp.com/auth/valyd/callback"></div>
```

- [Button flow (redirect & popup modes)](/docs/flows/button)

## Starter project

A minimal Express app wired with `@valyd/sdk` — clone, fill `.env`, `npm run dev`.

- GitHub: `valyd-id/valyd-sandbox-starter` · [Download zip](/downloads/valyd-sdk-starter.zip)

## MCP server (AI agents)

Remote MCP server exposing verification as agent tools, secured with OAuth 2.1 + PKCE.

- [Setup](/ai/mcp-setup) · [Tools](/ai/mcp-tools) · Endpoint: `https://mcp.valyd.work/verification/mcp`

## Machine-readable

- [OpenAPI specs](/docs/api-reference) — the canonical contract
- [Postman collection](/valyd-postman-collection.json)
- [llms.txt](/llms.txt) — the agent-readable docs index
