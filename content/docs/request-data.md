# Request user data (consent)

## Agent Quick-Start
- Source URL: https://docs.valyd.work/docs/request-data
- Credentials / env vars needed: VALYD_CLIENT_ID, VALYD_CLIENT_SECRET (server-side); the subject's `valyd_id` (from login)
- Runs on: `valyd.auth` (the ValydClient) — NOT `valyd.verify`
- Extra dependency: `libsodium-wrappers` (only for self-custody decryption; `npm i libsodium-wrappers`)
- Two ways to ask: **at login** (on the consent screen — no human polling) or **after login** (`requestAttributes`, the user approves in their Valyd app)
- Prerequisites: the app has a backend to hold the X25519 secret key + `clientSecret`

Login and the verification APIs return **proofs** — a pseudonym, `id_verified`, license badges, age
bands. When you need a user's **raw personal attributes** (legal name, date of birth, country, …),
you request them explicitly. The user **consents to the release**, and the values come back
**end-to-end encrypted** — sealed to a key only you hold, so Valyd never sees them.

There are two ways to ask, both using the same keypair + sealed-box mechanism:

- **At login (recommended)** — add the attributes to your authorize URL. The user checks/unchecks
  them on the consent screen and the granted fields are delivered **inline with the login** as
  `attr_code`. No second step, no mobile face scan.
- **Any time after login** — call `requestAttributes` with the user's `valyd_id`; they approve in
  their Valyd app. Use this for data you didn't ask for at login (or that the user unchecked).

## At login: ask on the consent screen (recommended)

Put `attributes` + your X25519 public key on the authorize URL. The consent screen renders each
field as a checkbox the user can uncheck. On **Authorize**, the granted fields are sealed **on the
user's device** to your key and returned with the login as `attr_code`, which you exchange for the
values with `getConsentedAttributes`. Proofs (age bands, `id_verified`) release on consent alone;
raw identity fields need a face-assured session or a quick **in-page** face check (never a separate
device).

```javascript
import { Valyd, ValydClient } from "@valyd/sdk";

const valyd = new Valyd({
  clientId:     process.env.VALYD_CLIENT_ID,
  clientSecret: process.env.VALYD_CLIENT_SECRET, // server-side only
  redirectUri:  "https://your-app.com/callback",
});

// 1. Keypair — keep secretKey SERVER-SIDE, stash it against `state` for the callback.
const { publicKey, secretKey } = await ValydClient.generateRequesterKeypair();

// 2. Send the user to the authorize URL WITH the data you want (checkboxes on consent).
const url = valyd.auth.getAuthorizationUrl({
  scope: ["openid", "profile"],
  state,
  attributes: ["legal_name", "dob", "is_18_plus"],
  requesterPublicKey: publicKey,
  purpose: "Confirm your identity",
});
// -> redirect the browser to `url`

// 3. On your callback: exchange the code AND fetch the consented data with attrCode.
const { code, attrCode } = valyd.auth.parseCallback(callbackUrl);
const { user } = await valyd.auth.exchangeCode(code);
if (attrCode) {
  const result = await valyd.auth.getConsentedAttributes(attrCode, { secretKey });
  result.attributes; // { legal_name, dob, is_18_plus } — only what the user kept checked
}
```

You only receive what the user kept checked. If they unchecked a field you need, ask again after
login with `requestAttributes` (below). This is opt-in — apps that only need login send none of
these params and get pseudonyms as before.

### At login, without the SDK (REST)

The consent screen calls this for you when the user clicks Authorize; you don't call it directly.
Your app just (1) puts `attributes` + `requester_public_key` on the authorize URL, then (2) reads
`attr_code` off the callback and fetches it:

```bash
# Fetch the consented, sealed attributes (attr_code came back on your callback)
curl "https://idp.valyd.work/api/auth/attribute-request/$ATTR_CODE/result?client_id=$VALYD_CLIENT_ID"
# -> { "data": { "status": "released", "custody": "self", "sealed_payload": "<base64>" } }
# Open sealed_payload with your X25519 secret key (libsodium sealed box).
```

## After login: request attributes (self-custody)

Need data you didn't ask for at login? Generate a keypair, request the attributes with the user's
`valyd_id`, then poll for the approved result — the user approves in their Valyd app. Passing your
`secretKey` to `getAttributeResult` opens the sealed box locally, so the plaintext never leaves
your server.

```javascript
import { Valyd, ValydClient } from "@valyd/sdk";

const valyd = new Valyd({
  clientId: process.env.VALYD_CLIENT_ID,
  clientSecret: process.env.VALYD_CLIENT_SECRET, // server-side only
});

// 1. Generate an X25519 keypair. Keep secretKey SERVER-SIDE and persist it for this
//    request — a fresh keypair cannot open a payload sealed to an older key.
const { publicKey, secretKey } = await ValydClient.generateRequesterKeypair();

// 2. Request the attributes. valydId comes from the logged-in user.
//    The user is prompted to approve in their Valyd app.
const { requestId } = await valyd.auth.requestAttributes({
  valydId,
  attributes: ["legal_name", "dob", "country"],
  requesterPublicKey: publicKey,
  purpose: "Confirm your legal name for payroll onboarding", // shown on the consent prompt
});

// 3. Poll until approved. secretKey makes the SDK decrypt locally; Valyd stays blind.
const result = await valyd.auth.getAttributeResult(requestId, { secretKey });
if (result.status === "approved" || result.status === "released") {
  result.attributes; // { legal_name: "Ada Lovelace", dob: "1990-01-01", country: "GB" }
}
```

**Install the crypto dependency.** The self-custody methods (`generateRequesterKeypair`,
`getAttributeResult` with a `secretKey`, `openSealedPayload`) use `libsodium-wrappers`, which the SDK
lazy-loads and does not bundle. Run `npm i libsodium-wrappers` in your project — otherwise you get
`No such module libsodium-wrappers` the first time you decrypt. Nothing else in the SDK needs it.

## Managed custody (no crypto on your side)

Prefer not to install libsodium? Hand Valyd the secret key and it opens the box for you —
`attributes` comes back as plaintext. The trade-off is real: **Valyd can read the released values**,
so you give up end-to-end privacy. Fine for testing; prefer self-custody for real personal data.

```javascript
const { requestId } = await valyd.auth.requestAttributes({
  valydId,
  attributes: ["legal_name", "dob"],
  requesterPublicKey: publicKey,
  managedPrivateKey: secretKey, // Valyd decrypts
});

const r = await valyd.auth.getAttributeResult(requestId); // no secretKey needed
r.attributes; // plaintext, decrypted by Valyd
```

## Without the SDK (REST)

```bash
# 1. Create the request (send your base64 X25519 public key)
curl -X POST https://idp.valyd.work/api/auth/attribute-request \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "valyd_id": "valyd_...",
        "attributes": ["legal_name","dob","country"],
        "requester_public_key": "<base64 X25519 pubkey>",
        "purpose": "Payroll onboarding" }'
# -> { "data": { "request_id": "...", "status": "pending" } }

# 2. The USER approves in their Valyd app. Then poll:
curl https://idp.valyd.work/api/auth/attribute-request/<request_id>/result \
  -H "Authorization: Bearer $CLIENT_TOKEN"
# -> { "data": { "status": "approved", "sealed_payload": "<base64>" } }
# Open sealed_payload with your X25519 secret key (libsodium sealed box).
```

## Things to know

- **Consent is remembered per app.** Once a user approves a field for your app, they aren't
  re-prompted on later logins — you receive it inline automatically. The user can revoke an app
  (and its data) from *Connected sites* in their Valyd account, which asks again next login.
- **At login**, the release is synchronous — the user consents on the screen and `attr_code` is on
  your callback. **After login** (`requestAttributes`) it is asynchronous — the user approves in
  their Valyd app; poll `getAttributeResult` (`pending → approved / released`, or `denied` / `expired`).
- **The user chooses what to share.** You receive only the fields left checked; unchecked ones are
  omitted. Fields the user hasn't verified (no KYC) aren't offerable.
- **Read it promptly.** The sealed payload is purged about 5 minutes after approval; the `attr_code`
  is one-time and short-lived.
- **Needs a backend.** Keypair generation, the `secretKey`, and opening the sealed box are
  server-side only — a browser-only SPA can't do self-custody safely.
- **Persist the keypair** for the life of the request. A new keypair cannot open a payload sealed to
  an older public key.
- Keep `secretKey` and `clientSecret` server-side only — never in browser code.

## Related

- Proofs already granted at login: `valyd.auth.getUserInfo(token)`, `getLicenses(token)`,
  `getVerifications(token)`.
- Run a verification check (KYC, liveness, face, license): `valyd.verify.*` — returns a proof, not
  raw data.
