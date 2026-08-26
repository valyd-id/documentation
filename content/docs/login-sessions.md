# OIDC session security

Connect with Valyd uses the standard OIDC Authorization Code flow. Keep one complete login
transaction in the user's server-side session:

- `state` prevents callback CSRF;
- `nonce` binds the ID token to this login;
- the S256 PKCE verifier binds the authorization code to this transaction;
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

`handleCallback()` checks state, sends the PKCE verifier, exchanges the one-time code, verifies the
RS256 signature through discovery/JWKS, and validates issuer, audience, time claims, and nonce.

## Production checklist

- Use an encrypted, server-side session store such as Redis or your database.
- Make the session cookie `HttpOnly`, `Secure`, and `SameSite=Lax`.
- Expire unused OIDC transactions after a few minutes.
- Consume each transaction once and reject callbacks without one.
- Never log authorization codes, tokens, client secrets, or PKCE verifiers.
- Persist each newly rotated refresh token atomically.
