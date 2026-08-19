# Create your account

Everything starts at [dev.valyd.work](https://dev.valyd.work) — a guided setup that ends with
**your app created and ready-to-run code on screen**. About two minutes.

## 1. Tell us what you're verifying

Open **https://dev.valyd.work** — the setup wizard starts right away. Pick your use case and
we pre-configure the right checks (you can fine-tune everything later):

![Step 1 — pick what you're verifying](/images/screenshots/portal-onboarding-verifications.png)

## 2. Configure your checks

Review the checks the wizard picked for your use case — add or remove what you need:

![Step 2 — configure your checks](/images/screenshots/portal-onboarding-step2.png)

## 3. Name your app (or skip)

Give your first app a name and optionally a redirect URL — or **Skip — just log me in** and
create it later. Scopes (`profile`, `verifications`, …) are pre-selected; they control what your
app may request from users, and every scope answer is delivered as **zero-knowledge-style
proofs** — the fact (`id_verified: true`, `is_18_plus`), never the underlying data:

![Step 3 — name your first app or skip](/images/screenshots/portal-onboarding-step3.png)

## 4. Sign in

One sign-in creates your developer account:

![The sign-in dialog: Continue with Valyd ID or an email magic link](/images/screenshots/portal-onboarding-signin.png)

- **Continue with Valyd ID** — face sign-in with the Valyd app; also lets you log into your own
  apps and run verifications with your identity.
- **Continue with email** — a one-time magic link, no password. You can connect a Valyd ID later
  from the dashboard.

> 💰 **New accounts start with a $100 welcome credit** — run real logins and verifications while
> [testing](/docs/testing) without adding a card.

## 5. You're in — with ready-to-go code

The wizard finishes on your app's page: credentials in a `.env` block and working backend code,
pre-filled with **your** values — copy, paste, run:

![Your ready-to-go integration code, pre-filled with your credentials](/images/screenshots/portal-ready-code.png)

## Where things live from here

- **Finish app setup** — register your production redirect URI and scopes:
  [Set up Sign in with Valyd](/docs/quick-start) (this page's steps 1–3 are its step 1 done).
- **Apps** ([Sign in with Valyd](/docs)) — `client_id`/`client_secret`, scopes, redirect URIs:
  [Dev portal setup](/docs/create-project), then a [quickstart](/docs/quickstarts) for your stack.
- **Verification** — account-connected verification lives **inside your app**; standalone
  projects live **on the dashboard**: [Verification setup](/verifications/setup).
