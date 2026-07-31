import { UserCheck, ShieldCheck, KeyRound, AlertTriangle, Package } from "lucide-react";
import { CodeBlock } from "../CodeBlock";

/**
 * Consent-gated attribute request — how an app asks a Valyd user for raw personal
 * data (legal name, DOB, …). The user approves in their Valyd app, and the values
 * are returned end-to-end encrypted. Documented on the Login side because it runs on
 * `valyd.auth` (the ValydClient), not on verification.
 */
const consentFlow = `import { Valyd, ValydClient } from "@valyd/sdk";

const valyd = new Valyd({
  clientId:     process.env.VALYD_CLIENT_ID,
  clientSecret: process.env.VALYD_CLIENT_SECRET, // server-side only
  redirectUri:  "https://your-app.com/callback",
});

// 1. Generate an X25519 keypair. Keep secretKey SERVER-SIDE and stash it against \`state\`
//    (you'll need it on the callback to open the sealed box).
const { publicKey, secretKey } = await ValydClient.generateRequesterKeypair();

// 2. Send the user to the authorize URL WITH the data you want. The consent screen shows
//    each field as a checkbox the user can uncheck.
const url = valyd.auth.getAuthorizationUrl({
  scope: ["openid", "profile"],
  state,
  attributes: ["legal_name", "dob", "is_18_plus"],
  requesterPublicKey: publicKey,
  purpose: "Confirm your identity",
});
// -> redirect the browser to \`url\`

// 3. On your callback: exchange the code AND fetch the consented data with attrCode.
const { code, attrCode } = valyd.auth.parseCallback(callbackUrl);
const { user } = await valyd.auth.exchangeCode(code);
if (attrCode) {
  const result = await valyd.auth.getConsentedAttributes(attrCode, { secretKey });
  result.attributes; // { legal_name, dob, is_18_plus } — only what the user kept checked
}`;

const sdkFlow = `import { Valyd, ValydClient } from "@valyd/sdk";

const valyd = new Valyd({
  clientId: process.env.VALYD_CLIENT_ID,
  clientSecret: process.env.VALYD_CLIENT_SECRET, // server-side only
});

// 1. Generate an X25519 keypair. Keep secretKey SERVER-SIDE and persist it for
//    this request — a fresh keypair cannot open a payload sealed to an older key.
const { publicKey, secretKey } = await ValydClient.generateRequesterKeypair();

// 2. Request the attributes. valydId comes from the logged-in user
//    (valyd.auth.exchangeCode(code) -> user.valyd_id). The user is prompted to approve.
const { requestId } = await valyd.auth.requestAttributes({
  valydId,
  attributes: ["legal_name", "dob", "country"],
  requesterPublicKey: publicKey,
  purpose: "Confirm your legal name for payroll onboarding", // shown on the consent prompt
});

// 3. Poll until the user approves. Passing secretKey makes the SDK open the sealed
//    box LOCALLY — Valyd never sees the values.
const result = await valyd.auth.getAttributeResult(requestId, { secretKey });
if (result.status === "approved" || result.status === "released") {
  result.attributes; // { legal_name: "Ada Lovelace", dob: "1990-01-01", country: "GB" }
}`;

const managedFlow = `// Managed custody: hand Valyd the secret key and it opens the box for you.
// You never touch libsodium — but Valyd can read the released values.
const { requestId } = await valyd.auth.requestAttributes({
  valydId,
  attributes: ["legal_name", "dob"],
  requesterPublicKey: publicKey,
  managedPrivateKey: secretKey, // <- Valyd decrypts
});

const r = await valyd.auth.getAttributeResult(requestId); // no secretKey needed
r.attributes; // plaintext, decrypted by Valyd`;

const restFlow = `# 1. Create the request (send your base64 X25519 public key)
curl -X POST https://idp.valyd.id/api/auth/attribute-request \\
  -H "Authorization: Bearer $CLIENT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "valyd_id": "valyd_...",
        "attributes": ["legal_name","dob","country"],
        "requester_public_key": "<base64 X25519 pubkey>",
        "purpose": "Payroll onboarding" }'
# -> { "data": { "request_id": "...", "status": "pending" } }

# 2. The USER approves in their Valyd app. Then poll:
curl https://idp.valyd.id/api/auth/attribute-request/<request_id>/result \\
  -H "Authorization: Bearer $CLIENT_TOKEN"
# -> { "data": { "status": "approved", "sealed_payload": "<base64>" } }
# Open sealed_payload with your X25519 secret key (libsodium sealed box).`;

export const RequestDataSection = () => (
  <section id="request-data" className="scroll-mt-8 space-y-8">
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
        <UserCheck className="h-6 w-6 text-primary" /> Request user data (consent)
      </h2>
      <p className="text-muted-foreground leading-relaxed max-w-2xl">
        Login and the verification APIs return <strong>proofs</strong> — a pseudonym,{" "}
        <code>id_verified</code>, license badges, age bands. When you need a user's{" "}
        <strong>raw personal attributes</strong> (legal name, date of birth, country, …), you ask
        for them explicitly. The user <strong>consents to the release</strong>, and the values come
        back <strong>end-to-end encrypted</strong> — sealed to a key only you hold, so Valyd never
        sees them.
      </p>
      <p className="text-muted-foreground leading-relaxed max-w-2xl mt-3">
        There are two ways to ask, and both use the same keypair + sealed-box mechanism:
      </p>
      <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground leading-relaxed max-w-2xl mt-2">
        <li>
          <strong className="text-foreground">At login (recommended)</strong> — add the attributes
          to your authorize URL. The user checks/unchecks them on the consent screen and the granted
          fields are delivered <strong>inline with the login</strong>. No second step, no mobile face
          scan.
        </li>
        <li>
          <strong className="text-foreground">Any time after login</strong> — call{" "}
          <code>requestAttributes</code> with the user's <code>valyd_id</code>; they approve in their
          Valyd app. Use this for data you didn't ask for at login (or that the user unchecked).
        </li>
      </ul>
    </div>

    {/* At authorize time — Mode 2 */}
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-primary" /> At login: ask on the consent screen (recommended)
      </h3>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Put <code>attributes</code> + your X25519 public key on the authorize URL. The consent screen
        renders each field as a checkbox (checked by default) the user can uncheck. On{" "}
        <strong>Authorize</strong>, the granted fields are sealed <strong>on the user's device</strong>{" "}
        to your key and returned with the login as <code>attr_code</code> — which you exchange for the
        values with <code>getConsentedAttributes</code>. Proofs (age bands, <code>id_verified</code>)
        release on consent alone; raw identity fields need a face-assured session or a quick{" "}
        <strong>in-page</strong> face check (never a separate device).
      </p>
      <CodeBlock code={consentFlow} language="javascript" title="Node · @valyd/sdk (login + data)" />
      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p>
          You only receive what the user kept checked. If they unchecked a field you need, ask again
          after login with <code>requestAttributes</code> (below). Requesting attributes is opt-in —
          apps that only need login send none of this and get pseudonyms as before.
        </p>
      </div>
    </div>

    <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
      <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
      <p>
        This runs on <code>valyd.auth</code> (the <code>ValydClient</code>), not on{" "}
        <code>valyd.verify</code>. You need the subject's <code>valyd_id</code> first — get it from
        login (<code>valyd.auth.exchangeCode(code)</code> → <code>user.valyd_id</code>).
      </p>
    </div>

    {/* The three steps, SDK */}
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <UserCheck className="h-5 w-5 text-primary" /> After login: request attributes (self-custody)
      </h3>
      <p className="text-sm text-muted-foreground">
        Need data you didn't ask for at login? Generate a keypair, request the attributes with the
        user's <code>valyd_id</code>, then poll for the approved result — the user approves in their
        Valyd app. Passing your <code>secretKey</code> to <code>getAttributeResult</code> decrypts the
        sealed box locally, so the plaintext values never leave your server.
      </p>
      <CodeBlock code={sdkFlow} language="javascript" title="Node · @valyd/sdk" />
      <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-muted-foreground">
        <Package className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
        <p>
          <strong className="text-foreground">Install the crypto dependency.</strong> The self-custody
          methods (<code>generateRequesterKeypair</code>, <code>getAttributeResult</code> with a{" "}
          <code>secretKey</code>, <code>openSealedPayload</code>) use{" "}
          <code>libsodium-wrappers</code>, which the SDK lazy-loads and does not bundle. Run{" "}
          <code>npm i libsodium-wrappers</code> in your project — otherwise you get{" "}
          <em>"No such module libsodium-wrappers"</em> the first time you decrypt. The rest of the SDK
          needs nothing extra.
        </p>
      </div>
    </div>

    {/* Managed custody */}
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Managed custody (no crypto on your side)</h3>
      <p className="text-sm text-muted-foreground">
        Prefer not to install libsodium? Hand Valyd the secret key and it opens the box for you —{" "}
        <code>attributes</code> comes back as plaintext. The trade-off is real:{" "}
        <strong>Valyd can read the released values</strong>, so you give up end-to-end privacy. Fine
        for testing; prefer self-custody for real personal data.
      </p>
      <CodeBlock code={managedFlow} language="javascript" title="Node · managed custody" />
    </div>

    {/* REST */}
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Without the SDK (REST)</h3>
      <CodeBlock code={restFlow} language="bash" title="cURL" />
    </div>

    {/* Notes */}
    <div className="rounded-lg border border-border bg-muted/40 p-5">
      <h3 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-primary" /> Things to know
      </h3>
      <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground leading-relaxed">
        <li>
          <strong>Consent is remembered per app.</strong> Once a user approves a field for your app,
          they aren't re-prompted on later logins — you receive it inline automatically. The user can
          revoke an app (and its data) any time from <em>Connected sites</em> in their Valyd account,
          which asks again on the next login.
        </li>
        <li>
          <strong>At login it's synchronous; after login it's not.</strong> <code>requestAttributes</code>{" "}
          needs the user to approve in their Valyd app — poll <code>getAttributeResult</code>; status
          moves <code>pending → approved / released</code> (or <code>denied</code> / <code>expired</code>).
        </li>
        <li>
          <strong>Read it promptly.</strong> The sealed payload is purged about 5 minutes after
          approval.
        </li>
        <li>
          <strong>Persist the keypair</strong> for the life of the request. A new keypair cannot open
          a payload sealed to an older public key.
        </li>
        <li>
          Keep <code>secretKey</code> and <code>clientSecret</code> server-side only — never in
          browser code.
        </li>
      </ul>
    </div>
  </section>
);
