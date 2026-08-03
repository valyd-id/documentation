> Source: https://docs.valyd.work/docs/overview
> Part of: Valyd ID API documentation — static copy generated for AI agents
> Generated from repo component: OverviewSection.tsx

# Valyd Third-Party SSO API

## Agent Quick-Start
- Source URL: https://docs.valyd.work/docs/overview
- Credentials / env vars needed: client_id, client_secret (obtain from the Developer Portal — see Prerequisites)
- Files an integrator edits: none — reference / orientation page only
- Estimated steps: 6 (the end-to-end OAuth2 SSO flow described below)
- Can complete without human input: NO — obtaining credentials requires signing up at https://dev.valyd.work and creating a project (a human-only web step)
- Prerequisites:
  - A basic Valyd account (sign up at https://dev.valyd.work — no KYC verification required)
  - A registered project in the Developer Portal that provides your `client_id` and `client_secret`
  - A backend capable of making server-side HTTPS requests (to keep `client_secret` secret)

Integrate secure identity verification and authentication into your application using Valyd's OAuth2-based Single Sign-On system. Get access to verified user profiles, professional licenses, and identity verification data.

## Base URL

```text
https://idp.valyd.work/api/auth/tpsso
```

## Integration Flow

Access to the Developer Portal requires a basic Valyd account. No KYC verification needed — just sign up at https://dev.valyd.work to get your API credentials.

The end-to-end OAuth2 SSO flow has six steps:

1. **Create Project** — Register your application at https://dev.valyd.work to get your client credentials (`client_id` and `client_secret`).
2. **Redirect to Authorization** — When a user clicks "Login with Valyd", redirect them to the authorization URL with your `client_id` and requested `scope`s.
3. **User Consent** — The user sees the consent screen with the requested permissions and approves access.
4. **Receive Authorization Code** — After approval, the user is redirected to your callback URL with a one-time code (valid for 5 minutes).
5. **Exchange Code for Tokens** — Your backend exchanges the code for an `access_token` and `refresh_token` using your `client_secret`.
6. **Access Protected Resources** — Use the `access_token` to call `/userinfo`, `/licenses`, and `/verifications` endpoints.

### Authorization URL shape

The authorization URL is built from the IdP base host `https://idp.valyd.work`, the `/auth` path, and query parameters. `scope` is a space-separated list, URL-encoded.

```text
https://idp.valyd.work/auth?client_id=YOUR_CLIENT_ID&redirect_url=YOUR_REDIRECT_URI&scope=profile%20verifications
```

- `YOUR_CLIENT_ID` — get this from the Developer Portal → your project → Credentials: https://dev.valyd.work
- `YOUR_REDIRECT_URI` — the Redirect URL you registered for the project in the Developer Portal (must NOT end with a trailing slash)
- `scope` — space-separated scope list (e.g. `profile verifications zkp`), URL-encoded so the space becomes `%20`

## Security Notes

- Keep your `client_secret` server-side only — never expose it in frontend code.
- `access_token` is short-lived (15 minutes); `refresh_token` is longer-lived.

  Note: the component lists `access_token` as "short-lived (15 minutes)" in the Security Notes, while the Integration Flow text describes it generically as "short-lived". 15 minutes is the explicit value given.
- Always use HTTPS for all API calls.
- Store tokens securely and never log them in production.

## Developer Tools

The live documentation page includes a Postman Collection generator widget for exploring these endpoints interactively. It is a UI convenience and produces a Postman collection for the same endpoints described here; there is no additional API surface beyond the endpoints listed above.
