# Complete example — Login with Valyd

> 🔑 **Auth:** `client_id` + `client_secret` (server-side) · 👤 **This IS the login** — standard OpenID Connect · 📖 **After login:** read the account with a Bearer access token

This page is now the stack-by-stack **[Quickstarts](/docs/quickstarts)** — Node.js, Next.js,
Python, PHP, cURL, or any OIDC library, each a complete working login.

The direct successor of the example that lived here is the
**[Node.js (Express) quickstart](/docs/quickstart/node)** — the same single-file app, line by line.

Prefer to clone it? [`valyd-sandbox-starter`](https://github.com/valyd-id/valyd-sandbox-starter)
on GitHub (or [download the zip](/downloads/valyd-sdk-starter.zip)) — fill `.env`, `npm run dev`:

```bash
npm install @valyd/sdk@^1.10.4 express express-session dotenv
```
