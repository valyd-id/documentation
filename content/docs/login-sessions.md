# OIDC session security

Connect with Valyd uses the standard OIDC Authorization Code flow. Keep one complete login
transaction in the user's server-side session:

- `state` prevents callback CSRF;
- `nonce` binds the ID token to this login;
- the S256 PKCE verifier binds the authorization code to this transaction (PKCE is **required**
  for every client);
- `redirect_uri` must exactly match the registered callback.

The SDK generates and validates these values together.

## Start login

```typescript
app.get("/login", (req, res) => {
  const transaction = valyd.createAuthorizationRequest({
    scope: ["profile", "verifications"],
  });

  req.session.valydOidc = transaction;
  res.redirect(transaction.url);
});
```

Store the transaction on the server. Do not place it in local storage or expose the PKCE verifier
to browser JavaScript.

## Handle the callback

```typescript
app.get("/auth/valyd/callback", async (req, res) => {
  const transaction = req.session.valydOidc;
  delete req.session.valydOidc; // consume once

  if (!transaction) return res.status(400).send("Login expired");

  const result = await valyd.handleCallback(req.originalUrl, { transaction });
  req.session.user = result.user;
  res.redirect("/account");
});
```

`handleCallback()` surfaces a callback `error` (e.g. `access_denied` when the user cancels) as a
`ValydError`, checks state and the RFC 9207 `iss` parameter, sends the PKCE verifier, exchanges the
one-time code, verifies the RS256 signature through discovery/JWKS, and validates issuer,
audience, time claims, and nonce. Wrap it in `try`/`catch` and show a friendly message for
`access_denied`.

## Controlling re-authentication

The Valyd IdP keeps its own browser session, so a user who signed in recently usually comes
straight back without a prompt. Add these to the authorization request when you need something
different:

| Parameter | Effect |
| --- | --- |
| `prompt=none` | Silent check — no UI. Returns `error=login_required` if there's no (or a stale) Valyd session, or `consent_required` if a third-party app has no live prior grant for these scopes. |
| `prompt=login` / `prompt=select_account` | Force the user to authenticate again. |
| `prompt=consent` | Always show the consent screen, even for trusted first-party apps. |
| `max_age=N` | Re-authenticate if the last real sign-in was more than `N` seconds ago. |
| `id_token_hint` | With `prompt=none`, a different signed-in user returns `login_required`. |

The ID token's `auth_time` is always the time of the user's last real sign-in — check it
yourself for step-up flows.

## Logout

Clear your own session, then redirect the browser to the `end_session_endpoint`
(`valyd.auth.getEndSessionUrl({ idTokenHint, postLogoutRedirectUri, state })`). This **ends the
user's Valyd session in that browser** and revokes your app's tokens for the user, so the next
login asks them to sign in again. See [Refresh & logout](/docs/flows/refresh#logout--revocation).

## Production checklist

- Use an encrypted, server-side session store such as Redis or your database.
- Make the session cookie `HttpOnly`, `Secure`, and `SameSite=Lax`.
- Expire unused OIDC transactions after a few minutes.
- Consume each transaction once and reject callbacks without one.
- Never log authorization codes, tokens, client secrets, or PKCE verifiers.
- Persist each newly rotated refresh token atomically.
- Verify the callback `iss` equals the issuer (the SDK does this).
