# How Valyd works

New to Valyd or OIDC? Here's the whole mental model in one picture: **a person verifies once, the
proof lives on their Valyd ID, and every app that adds Connect with Valyd just reads it.**

The three pictures below unpack that loop.

## 1. A person verifies once

Somewhere — in your app, or any app using Valyd — a person proves who they are: they scan their
ID, pass a liveness check, match their face, or have a professional license looked up. Valyd runs
that check for real (there are no simulated results) and, when the person has a Valyd account,
the passed outcome is saved to it as a **proof**.

## 2. They connect their identity to your app

**Connect with Valyd** is a standard OIDC button (its "Sign in with Valyd" form can double as your
login button, like "Sign in with Google"). The person
authenticates with their verified identity — face, not passwords — and approves what your app
may read (the [scopes](/docs/scopes)). Your backend gets tokens.

You never see their documents — you read the **answers**: `id_verified: true`, verified
licenses, age bands.

## 3. Need a new check? Attach it to the account

If the account doesn't hold the proof you need yet, run the check yourself — with the signed-in
user's token attached, so the result saves back to their account:

That's the loop: **verify once → sign in anywhere → read the proof — and only re-verify when
your policy wants a fresher answer.**

## The two products

Everything above is **Reusable Verification**: the person connects their Valyd identity via
Connect with Valyd, your app [reads the verified data](/docs/user-token/account) it already holds,
and [runs a verification](/verifications/quickstart) through a configured
[workflow](/verifications/workflows) for anything missing.

There is one deliberately separate product: the **[Unique Human API](/verifications/standalone)**.
It answers a single question — *is this a live, unique human?* — with nothing but your API key:
[Liveness](/verifications/standalone/antispoof) stops a photo or replay standing in for a real
person, and [Uniqueness](/verifications/standalone/face-uniqueness) catches the same face opening
a second account. No user login is involved, the result returns straight to your caller, and
storing and protecting the person's data is your responsibility.

## What workflows let you build

The [workflow checks](/verifications/types) aren't just onboarding KYC — you run a verification
**whenever** you need fresh proof, tied to the signed-in person:

- **Prove it's really them, right now** — a face match against their enrolled face before a
  sensitive action (a payout, a settings change, a shift clock-in).
- **Confirm they're actually there** — a location check proves the person is where they claim
  (home-visit care, field work, geofenced access).
- **Re-check a live credential** — re-verify a professional license against the registry so an
  expired or revoked one is caught, not trusted from last year.
- **Confirm they're a live human** — liveness stops a photo or replay standing in for the real
  person.
- **Gate by age** — an age band (`is_18_plus`, …) without ever touching their date of birth.

Compose several into one [workflow](/verifications/workflows) and run them in a single
[session](/verifications/quickstart) — each passed check saves as a reusable proof on the person's
Valyd ID, so next time you just read it. **Verify once, then re-prove exactly what your policy
needs, exactly when it needs it.**

## Where to next

- Start at the beginning → [Introduction](/docs/introduction)
- Add the button → [Connect with Valyd](/docs)
- Run your first check → [Verification quickstart](/verifications/quickstart)
- The exact meaning of every term → [Concepts & terms](/docs/introduction#concepts--terms)
