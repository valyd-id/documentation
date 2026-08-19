# Developer accounts & sign-in

## How sign-in works (passwordless)

The Developer Portal at `https://dev.valyd.work` has **two** ways in — there is no password:

1. **Magic link (email).** Enter your email; Valyd sends a one-time sign-in link. Opening it signs
   you in. This is the usual path for owners, admins and developers.
2. **Face — "Login with Valyd".** If your account has a verified Valyd identity linked, you can sign
   in with your face (the same OAuth/OIDC "Login with Valyd" flow your own app uses).

Workforce **members** (the people your organization onboards to *use* your apps, not build them) do
not use either of the above — they activate and sign in **by face only**, from an invite. See
[Organizations & teams](/docs/organizations).

### Which one should I use?
- Just getting started, or no Valyd identity yet → **magic link**.
- You want faster, phishing-resistant sign-in → **link your face** (below), then use Login with Valyd.

## Connect your Valyd ID

An account created by magic link starts as **email-only**. You can attach a Valyd face identity to
it at any time so you can sign in by face and prove who you are:

1. Sign in (magic link) and open **Profile**.
2. Under your identity, choose **Connect your Valyd ID**.
3. Complete Login with Valyd (face). The returned identity is linked to your current, already
   signed-in account.

Notes:
- Linking **requires an authenticated session** by design — you connect a face *to the account you
  are already signed in to*. You cannot link a face to an account you are not signed in to.
- This is different from **Connected apps** on an *end-user's* Valyd account (the third-party sites a
  user authorized via Login with Valyd). Developer "Connect your Valyd ID" links *your own* face to
  *your own* console account.

## One person, multiple accounts

A single Valyd identity (your face) can **own several Developer Portal accounts** — most commonly one
account per company you work with. Valyd keeps them separate but lets you move between them without
signing in again.

- **When it appears:** if your email or face maps to more than one account, sign-in shows an
  **account picker** — choose which account to enter.
- **Switching later:** use **Switch account** (`/switch`) in the portal to hop between the accounts
  your identity already owns. No re-scan, no new magic link.
- **What stays separate per account:** projects/apps (`client_id`/`client_secret`), Verify workflows
  and API keys, billing, team and members. Switching accounts changes all of these.

> At the **identity** layer, a person is still **one face = one Valyd identity**. "Multiple accounts"
> is a **Developer Portal** concept: the one identity is the owner of multiple console tenants. (To
> use that one identity across multiple **devices**, pair each device — see
> [device pairing](/docs/create-project). That extends the same identity to another device; it does
> not create another account.)

## Personal apps vs organization apps

- **Personal apps** live under your individual account — any signed-in developer account can create
  them.
- **Organization apps** belong to a shared org tenant and are role-gated (owner / admin / developer).
  Ownership stays with the org even when a person leaves.

See [Organizations & teams](/docs/organizations) for roles, the face-verified workforce, and the
Members API.

## Managing your developer account

- **Rotate a client secret:** open the app in the portal and use **Rotate secret** on its
  credentials. The old secret stops working immediately, so deploy the new one first.
- **Delete your developer account:** Profile → danger zone. Deleting cascades to the apps you
  own; other console accounts your identity also owns are kept and simply unlinked.

## Common questions

- **"What's my password?"** — There isn't one. Use the magic link, or face if you've linked it.
- **"I got an account picker I didn't expect."** — Your email/identity owns more than one account.
  Pick the right company; use **Switch account** later to change.
- **"Can I automate portal login for CI?"** — No. Sign-in, linking and switching are human portal
  steps. For server-to-server automation use an app's `client_id`/`client_secret` (Login with Valyd)
  or an app's **API key** (Verification APIs) — not a portal login.
