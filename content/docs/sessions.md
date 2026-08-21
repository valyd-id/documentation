# Sessions

> 📄 **This page moved.** Login sessions are now documented alongside the tokens that make them:
> **[Tokens & login sessions](/docs/tokens)**. This stub stays so old links keep working.

Valyd uses "session" for two unrelated things — don't confuse them:

- A **login session** is a signed-in user: an access token (~15 min) plus a rotating refresh token
  (30 days) held by your backend. See [Tokens & login sessions](/docs/tokens#login-sessions).
- A **verification session** is one person's single run through a check, ending in a decision. See
  [Session lifecycle](/verifications/session-lifecycle).

"Session expired" from a resource API means *refresh the access token*; `EXPIRED` from the decision
API means *create a new verification session*.
