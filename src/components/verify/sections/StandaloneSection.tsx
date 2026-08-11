import { Link } from "react-router-dom";
import { ArrowRight, Server, MapPin } from "lucide-react";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { LanguageTabs } from "@/components/docs/LanguageTabs";
import { VERIFY_CONFIG, CONSOLE_HOST } from "@/lib/verify-config";

const BASE = VERIFY_CONFIG.API_BASE_URL;

const Endpoint = ({
  id,
  method,
  path,
  title,
  description,
  curl,
  sdk,
  responseTitle = "check.data",
  response,
  fields,
  note,
}: {
  id?: string;
  method: string;
  path: string;
  title: string;
  description: string;
  curl: string;
  sdk: string;
  responseTitle?: string;
  response: string;
  fields?: React.ReactNode;
  note?: React.ReactNode;
}) => (
  <div id={id} className="scroll-mt-8 p-5 rounded-lg border border-border bg-card space-y-4">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">{method}</span>
        <code className="text-sm">{path}</code>
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
    {fields}
    {/* SDK first, cURL second — the SDK is the supported path. */}
    <LanguageTabs
      examples={[
        { language: "javascript", label: "SDK (Node)", code: sdk },
        { language: "bash", label: "cURL", code: curl },
      ]}
    />
    {note}
    <CodeBlock language="json" title={responseTitle} code={response} />
  </div>
);

const Field = ({ name, required, type, desc }: { name: string; required?: boolean; type: string; desc: string }) => (
  <li className="text-sm">
    <code className="text-foreground font-semibold">{name}</code>{" "}
    <span className="text-xs text-muted-foreground">{type}</span>{" "}
    {required && <span className="text-xs text-primary font-medium">required</span>}
    <span className="text-muted-foreground"> — {desc}</span>
  </li>
);

const INIT = `import { Valyd, readImage } from "@valyd/sdk";

const valyd = new Valyd({
  apiKey: process.env.VALYD_API_KEY,   // vrf_… from ${CONSOLE_HOST} — server-side only
});
const { standalone } = valyd.verify;   // the Core API checks`;

export const StandaloneSection = () => (
  <section id="standalone" className="scroll-mt-8 space-y-6">
    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
      <Server className="h-6 w-6 text-primary" /> Core APIs
    </h2>
    <p className="text-muted-foreground">
      Direct, synchronous, server-to-server checks — you build your own UI and call the endpoints from your backend.
      Every request carries <code>X-API-Key: &lt;your Verify API key&gt;</code> (keep it server-side, never ship it to the
      browser). The set: <code>id-verification</code>, <code>liveness</code>, <code>face-match</code>,{" "}
      <code>face-uniqueness</code> (one face = one user), <code>age-verification</code>,{" "}
      <code>credential-verification</code> (state + type, auto-resolved), <code>location</code>, and the combined{" "}
      <code>kyc-credential</code>.
    </p>

    {/* SDK first */}
    <div className="p-5 rounded-lg border border-border bg-card space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Start with the SDK</h3>
      <p className="text-sm text-muted-foreground">
        The official Node SDK is{" "}
        <a
          href="https://www.npmjs.com/package/@valyd/sdk"
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          <code>@valyd/sdk</code>
        </a>
        . Image fields accept a file path via <code>readImage("./x.jpg")</code>, a <code>Buffer</code>, or a base64 /
        data-URL string. Over plain HTTP, send images as base64 in the JSON field (or multipart under the same name).
      </p>
      <CodeBlock language="bash" code={`npm i @valyd/sdk`} />
      <CodeBlock language="javascript" code={INIT} />
    </div>

    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground">
      <strong className="text-foreground">Raw data vs proofs.</strong> Called <strong>without</strong> a Valyd user
      token, these are <strong>Non-account (Fresh)</strong> checks: you performed the capture, nothing is retained, and
      the response contains the <strong>raw extracted data</strong> (document <code>fields</code>, <code>dob</code>,
      portrait, OCR). Pass a <code>valydAccessToken</code> (or <code>valydId</code>) and the same endpoints run in{" "}
      <strong>Account (Managed by Valyd)</strong> mode instead — they answer from the user's stored identity and return{" "}
      <strong>proofs only</strong> (<code>id_verified</code>, match + score, license badges, age bands),{" "}
      <strong>never</strong> raw KYC. To obtain raw account attributes, use the{" "}
      <a href="?mode=managed#consent" className="text-primary hover:underline">consent Core API</a> — the user approves
      the release in their Valyd app.
    </div>

    {/* Core APIs: the same endpoints, two modes */}
    <div id="core-account-vs-fresh" className="scroll-mt-8 space-y-4">
      <h3 className="text-xl font-bold text-foreground">Core APIs: Account vs Non-account</h3>
      <p className="text-sm text-muted-foreground">
        These are the <strong>same endpoints</strong>. What changes is whether you send the user's{" "}
        <code>valyd_access_token</code>. Without it, you did the capture and get the raw result. With it, Valyd answers
        from the user's stored identity and returns a proof.
      </p>

      <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Endpoint</th>
              <th className="text-left px-4 py-3 font-medium">Non-account (Fresh) — no token</th>
              <th className="text-left px-4 py-3 font-medium">Account (Managed) — with token</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["POST /api/v2/id-verification",
               "Upload the ID → OCR. Returns the raw document fields (full_name, dob, document_number, portrait).",
               "No upload. Answers from the account: { id_verified: true|false } — never raw KYC."],
              ["POST /api/v2/face-match",
               "Compares the uploaded ID portrait against the selfie you send. Returns match + score.",
               "Compares the selfie against the account's stored face vector. Only the selfie leaves you."],
              ["POST /api/v2/liveness",
               "Selfie → live person or spoof. Returns status + score.",
               "Same — liveness is always a live capture."],
              ["POST /api/v2/face-uniqueness",
               "Enroll-or-match against the Valyd face registry (single-click selfie or live frames burst). Same face → same valyd_uuid, across every integrator. No user login needed.",
               "Same — Valyd stores the template either way; a face already on a Valyd account returns that account's id."],
              ["POST /api/v2/credential-verification",
               "You supply the name + licence. Searches the board and returns the raw record.",
               "Matched against the account's real name. The verified badge is stored on the account; you get a licence proof."],
              ["POST /api/v2/age-verification",
               "Derives age from the dob on the uploaded ID. Returns bands (and the dob is in the id-verification result).",
               "Derived from the stored dob → bands only. The dob is never echoed back."],
              ["POST /api/v2/location",
               "Mandatory GPS fix. With an expected point + radius_m, the status is the geofence verdict.",
               "Same. (Convention: only run it once the user has completed KYC.)"],
            ].map(([ep, fresh, acct]) => (
              <tr key={ep} className="border-t border-border align-top">
                <td className="px-4 py-3 font-mono text-xs text-foreground whitespace-nowrap">{ep}</td>
                <td className="px-4 py-3 text-muted-foreground">{fresh}</td>
                <td className="px-4 py-3 text-muted-foreground">{acct}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground">
        The same call, both ways — note the token in the body and the shape of what comes back:
      </p>
      <LanguageTabs
        examples={[
          {
            language: "javascript",
            label: "SDK — both modes",
            code: `// Non-account (Fresh): you captured the ID → you get the RAW data back.
const fresh = await standalone.idVerification({
  frontImage: readImage("./id_front.jpg"),
  backImage:  readImage("./id_back.jpg"),   // optional
});
fresh.check.data.fields.full_name;   // "JANE DOE"  ← raw OCR

// Account (Managed): send the user's Valyd token → a PROOF, no upload, no raw KYC.
const acct = await standalone.idVerification({ valydAccessToken });
acct.check.data.verified;            // true        ← proof only

// Face match, account mode: only the selfie leaves you — it is matched
// against the account's stored face vector (no reference/ID image).
const face = await standalone.faceMatch({ valydAccessToken, selfie: readImage("./selfie.jpg") });
face.check.score;                    // 0.93`,
          },
          {
            language: "bash",
            label: "cURL — both modes",
            code: `# No user token → you captured it, you get the raw data back.
curl -X POST ${BASE}/api/v2/id-verification \\
  -H "X-API-Key: $VALYD_API_KEY" -H "Content-Type: application/json" \\
  -d '{ "front_image": "<base64>", "back_image": "<base64>" }'
# → { data: { check: { type: "id_verification", status: "passed",
#      data: { fields: { full_name: "JANE DOE", date_of_birth: "1990-04-12" },
#              dob: "1990-04-12", portrait: "<base64>" } } } }

# With the user's Valyd token → proof only. No upload needed.
curl -X POST ${BASE}/api/v2/id-verification \\
  -H "X-API-Key: $VALYD_API_KEY" -H "Content-Type: application/json" \\
  -d '{ "valyd_access_token": "'"$USER_ACCESS_TOKEN"'" }'
# → { data: { check: { type: "id_verification", status: "passed",
#      data: { verified: true } } } }    # no name, no dob, no portrait`,
          },
        ]}
      />
    </div>

    <CodeBlock
      language="json"
      title="Every Core API response uses this envelope"
      code={`{
  "success": true,
  "data": {
    "session_id": "ses_…",
    "status": "passed",   // passed | failed | review
    "check": {
      "type": "id_verification" | "liveness" | "face_match" | "age" | "credential" | "location",
      "status": "passed" | "failed" | "review",
      "score": 0.97,
      "data": { /* per-check details */ },
      "error": null
    }
  },
  "error": null
}`}
    />

    {/* 1. ID Verification */}
    <Endpoint
      id="core-id-verification"
      method="POST"
      path="/api/v2/id-verification"
      title="ID Verification"
      description="OCR + authenticity from a government ID."
      fields={
        <ul className="space-y-1.5">
          <Field name="front_image" required type="image" desc="Front of the ID. File, Buffer, or base64/data-URL." />
          <Field name="back_image" type="image" desc="Back of the ID (when applicable)." />
          <Field name="valyd_access_token" type="string" desc="Account mode — answers from the user's Valyd identity (proof only, no upload)." />
        </ul>
      }
      sdk={`const { check } = await standalone.idVerification({
  frontImage: readImage("./id_front.jpg"),
  backImage:  readImage("./id_back.jpg"),   // optional
});

console.log(check.data.fields.full_name, check.data.fields.document_number);`}
      curl={`curl -X POST ${BASE}/api/v2/id-verification \\
  -H "X-API-Key: $VALYD_API_KEY" \\
  -F "front_image=@./id_front.jpg" \\
  -F "back_image=@./id_back.jpg"`}
      response={`{
  "fields": {
    "full_name": "Jane Doe",
    "fathers_name": "John Doe",
    "document_number": "X1234567",
    "date_of_birth": "1990-01-15",
    "date_of_issue": "2020-03-10",
    "date_of_expiry": "2030-03-10",
    "sex": "F",
    "issuing_state": "CA",
    "country": "US",
    "document_type": "driver_license"
  },
  "portrait": "<base64>",
  "dob": "1990-01-15",
  "authenticity": { "score": 0.96 }
}`}
    />

    {/* 2. Liveness */}
    <Endpoint
      id="core-liveness"
      method="POST"
      path="/api/v2/liveness"
      title="Liveness"
      description="Passive liveness check. Passes when live_score === 1."
      fields={
        <ul className="space-y-1.5">
          <Field name="image" required type="image" desc="A selfie. File, Buffer, or base64/data-URL." />
        </ul>
      }
      sdk={`const { check } = await standalone.liveness({
  image: readImage("./selfie.jpg"),
});
// check.status === "passed" when check.data.live_score === 1`}
      curl={`curl -X POST ${BASE}/api/v2/liveness \\
  -H "X-API-Key: $VALYD_API_KEY" \\
  -F "image=@./selfie.jpg"`}
      response={`{
  "live_score": 1,   // 1 = live, 0 = spoof, < 0 = no face detected
  "result": "live"
}`}
    />

    {/* 3. Face match */}
    <Endpoint
      id="core-face-match"
      method="POST"
      path="/api/v2/face-match"
      title="Face Match"
      description="Compare a selfie against a reference. Passes when similarity ≥ threshold (default ~0.95). In Account mode you send ONLY the selfie — it is matched against the stored Valyd face vector."
      fields={
        <ul className="space-y-1.5">
          <Field name="image1" type="image" desc="Reference image (typically the ID portrait). Omit in Account mode." />
          <Field name="image2" required type="image" desc="The live selfie." />
          <Field name="valyd_access_token" type="string" desc="Account mode — match against the user's stored face vector." />
        </ul>
      }
      sdk={`// Non-account: you supply both images.
const { check } = await standalone.faceMatch({
  idImage: readImage("./id_portrait.jpg"),
  selfie:  readImage("./selfie.jpg"),
});

// Account: selfie only, matched to the stored Valyd face vector.
await standalone.faceMatch({ valydAccessToken, selfie: readImage("./selfie.jpg") });
// check.data.similarity, check.data.threshold`}
      curl={`curl -X POST ${BASE}/api/v2/face-match \\
  -H "X-API-Key: $VALYD_API_KEY" \\
  -F "image1=@./id_portrait.jpg" \\
  -F "image2=@./selfie.jpg"`}
      response={`{ "similarity": 0.973, "threshold": 0.95 }`}
    />

    {/* 3b. Face uniqueness */}
    <Endpoint
      id="core-face-uniqueness"
      method="POST"
      path="/api/v2/face-uniqueness"
      title="Face Uniqueness"
      description="One face = one user — no Valyd account or user login required. Enrolls the face into the Valyd-stored registry, or returns its existing id if the face is already known: the same face always resolves to the same valyd_ uuid, so a second signup with a different email is caught instantly. Two modes: single-click (one selfie, passive liveness gate) or live verification (a 3–8 frame camera burst, verified with per-frame voting, motion analysis, and same-face consistency — a photo, screen replay, or spliced clip is rejected). Valyd stores the face template; you never handle biometrics."
      fields={
        <ul className="space-y-1.5">
          <Field name="selfie" type="image" desc="Single-click mode: one live selfie. File, Buffer, or base64/data-URL." />
          <Field name="frames[]" type="image[]" desc="Live verification mode: 3–8 chronological stills from a short camera burst (~1.5s). Send either selfie or frames." />
          <Field name="external_ref" type="string" desc="Your own user reference, stored on the enrollment link." />
        </ul>
      }
      sdk={`// Single-click verification (one selfie)
const { check } = await standalone.faceUniqueness({
  selfie: readImage("./selfie.jpg"),
  externalRef: "user_842",
});

// Live verification (3–8 burst frames — strongest guarantee)
await standalone.faceUniqueness({ frames: burstFrames });

// check.data.valyd_uuid — stable id for this face, same across every integrator
// check.data.registered — "new" | "existing"`}
      curl={`# Single-click
curl -X POST ${BASE}/api/v2/face-uniqueness \\
  -H "X-API-Key: $VALYD_API_KEY" \\
  -F "selfie=@./selfie.jpg"

# Live verification
curl -X POST ${BASE}/api/v2/face-uniqueness \\
  -H "X-API-Key: $VALYD_API_KEY" \\
  -F "frames[]=@./f0.jpg" -F "frames[]=@./f1.jpg" \\
  -F "frames[]=@./f2.jpg" -F "frames[]=@./f3.jpg"`}
      response={`{
  "valyd_uuid": "valyd_66e13c6acf1a42229bee0690c6130f77",
  "registered": "new"        // "existing" when this face was already registered
}`}
    />

    <Endpoint
      id="core-face-uniqueness-delete"
      method="DELETE"
      path="/api/v2/face-uniqueness/{valyd_uuid}"
      title="Face Uniqueness — Unlink"
      description="GDPR forget: removes YOUR project's link to the face id. When no project links remain (and the face is not a Valyd account), the stored template is deleted entirely — deleted: true."
      fields={
        <ul className="space-y-1.5">
          <Field name="valyd_uuid" required type="string (path)" desc="The id returned by the enroll call." />
        </ul>
      }
      sdk={`const res = await standalone.faceUniquenessUnlink("valyd_66e13c…");
// res.unlinked === true · res.deleted — template fully erased`}
      curl={`curl -X DELETE ${BASE}/api/v2/face-uniqueness/valyd_66e13c6acf1a42229bee0690c6130f77 \\
  -H "X-API-Key: $VALYD_API_KEY"`}
      response={`{ "valyd_uuid": "valyd_66e13c…", "unlinked": true, "deleted": true }`}
    />

    {/* 4. Age */}
    <Endpoint
      id="core-age-verification"
      method="POST"
      path="/api/v2/age-verification"
      title="Age Verification"
      description="JSON body. Computes age from DOB and verifies the requested age bands."
      fields={
        <ul className="space-y-1.5">
          <Field name="dob" required type="string (YYYY-MM-DD)" desc="Date of birth. Omit in Account mode — derived from the stored dob." />
          <Field name="bands" required type="string[]" desc='e.g. ["is_18_plus","is_21_plus"].' />
        </ul>
      }
      sdk={`const { check } = await standalone.ageVerification({
  dob: "1995-06-01",
  bands: ["is_18_plus", "is_21_plus"],
});`}
      curl={`curl -X POST ${BASE}/api/v2/age-verification \\
  -H "X-API-Key: $VALYD_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "dob": "1995-06-01", "bands": ["is_18_plus","is_21_plus"] }'`}
      response={`{
  "age": 30,
  "dob": "1995-06-01",
  "bands": {
    "is_18_plus": { "verified": true, "min_age": 18 },
    "is_21_plus": { "verified": true, "min_age": 21 }
  }
}`}
    />

    {/* 5. Credential */}
    <Endpoint
      id="core-credential-verification"
      method="POST"
      path="/api/v2/credential-verification"
      title="Credential Verification"
      description="Look up a professional license in the state board — just state + license type + number. The provider is auto-resolved (no provider_code needed). Registry lookups can take 10–60s — use a generous timeout."
      fields={
        <ul className="space-y-1.5">
          <Field name="license_state" required type="string" desc="2-letter state code. Alias: state." />
          <Field name="license_type" type="string" desc="Friendly type — 'MD' (default), 'DO', 'RN', 'NP', 'PA'. The provider is auto-resolved from state + type." />
          <Field name="license_number" required type="string" desc="Alias: license_no." />
          <Field name="full_name" required type="string" desc="Or first_name + last_name. The board matches on name + number. In Account mode the name comes from the account — don't pass it." />
          <Field name="provider_code" type="string" desc="Optional — only if you want to pin a specific board. Normally omit it." />
          <Field name="npi" type="string" desc="Optional NPI when applicable." />
        </ul>
      }
      sdk={`const { check } = await standalone.credentialVerification({
  licenseState:  "CA",
  licenseType:   "MD",       // default MD; provider auto-resolved — no provider_code
  licenseNumber: "A12345",
  fullName:      "Jane Doe", // Account mode: omit — the name comes from the account
});
// check.status === "passed" · check.data.match · check.data.license`}
      curl={`curl -X POST ${BASE}/api/v2/credential-verification \\
  -H "X-API-Key: $VALYD_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "license_state":  "CA",
    "license_type":   "MD",
    "license_number": "A12345",
    "full_name":      "Jane Doe"
  }'`}
      response={`{
  "match": true,
  "license": {
    "license_number": "A12345",
    "status": "active",
    "issued_at": "2015-01-01",
    "expires_at": "2027-01-01",
    "specialty": "Internal Medicine"
  }
}`}
    />

    {/* 6. KYC + Credential */}
    <Endpoint
      id="core-kyc-credential"
      method="POST"
      path="/api/v2/kyc-credential"
      title="KYC + Credential"
      description="Combined ID verification + liveness + face match + license lookup, in one call. The license is matched against the name OCR'd from the ID — never a client-supplied name — so the holder cannot impersonate someone else's license."
      fields={
        <ul className="space-y-1.5">
          <Field name="front_image" required type="image" desc="Front of the government ID." />
          <Field name="selfie" required type="image" desc="Live selfie for liveness + face match." />
          <Field name="back_image" type="image" desc="Back of the ID (when applicable)." />
          <Field name="license_type" required type="string" desc="Provider code. Alias: provider_code." />
          <Field name="license_state" required type="string" desc="State code. Alias: state." />
          <Field name="license_number" required type="string" desc="Alias: license_no." />
          <Field name="npi" type="string" desc="Optional NPI." />
        </ul>
      }
      sdk={`const result = await standalone.kycCredential({
  frontImage: readImage("./id_front.jpg"),
  selfie:     readImage("./selfie.jpg"),
  providerCode:  "MD",
  licenseState:  "CA",
  licenseNumber: "A12345",
});

// result.status === "passed" only when every check passes
// result.checks: [id_verification, liveness, face_match, credential]
// result.identity: { name, dob }  ← name used for the license match`}
      curl={`curl -X POST ${BASE}/api/v2/kyc-credential \\
  -H "X-API-Key: $VALYD_API_KEY" \\
  -F "front_image=@./id_front.jpg" \\
  -F "selfie=@./selfie.jpg" \\
  -F "license_type=MD" \\
  -F "license_state=CA" \\
  -F "license_number=A12345"`}
      responseTitle="data"
      response={`{
  "session_id": "ses_…",
  "status": "passed",
  "identity": { "name": "Jane Doe", "dob": "1990-01-15" },
  "checks": [
    { "type": "id_verification", "status": "passed", "data": { /* … */ } },
    { "type": "liveness",        "status": "passed", "data": { "live_score": 1 } },
    { "type": "face_match",      "status": "passed", "data": { "similarity": 0.97 } },
    { "type": "credential",      "status": "passed", "data": { "match": true, "license": { /* … */ } } }
  ]
}`}
    />

    {/* 7. Location */}
    <Endpoint
      id="core-location"
      method="POST"
      path="/api/v2/location"
      title="Location"
      description="A real GPS fix is ALWAYS mandatory — this step can never be skipped. Give an expected point + radius_m and the status IS the verdict: passed inside the radius, failed outside it."
      fields={
        <ul className="space-y-1.5">
          <Field name="latitude" required type="number" desc="Captured latitude (where the person actually is)." />
          <Field name="longitude" required type="number" desc="Captured longitude." />
          <Field name="accuracy" type="number" desc="Reported GPS accuracy radius in metres. Returned in data + score." />
          <Field name="expected_latitude" type="number" desc="Where they should be. Omit for capture-only." />
          <Field name="expected_longitude" type="number" desc="Where they should be. Omit for capture-only." />
          <Field name="radius_m" type="number" desc="The geofence. With it, the status is the verdict; without it, you only get distance_m." />
        </ul>
      }
      sdk={`// 1) Geofence — the status IS the verdict.
const { check } = await standalone.locationMatch({
  latitude: 37.3382, longitude: -121.8863, accuracy: 12,
  expectedLatitude: 37.3390, expectedLongitude: -121.8850,
  radiusM: 200,
});
check.status;          // "passed" inside the radius — "failed" outside it
check.data.match;      // true | false
check.data.distance_m; // 137.4

// 2) Expected point, NO radius → we can't judge: always "passed", distance reported.
await standalone.locationMatch({ latitude, longitude, expectedLatitude, expectedLongitude });
// → status "passed", data.match === null, data.distance_m === 119_300

// 3) No expected point → capture-only: "passed" + the accurate coordinates.
await standalone.locationMatch({ latitude, longitude, accuracy });`}
      curl={`curl -X POST ${BASE}/api/v2/location \\
  -H "X-API-Key: $VALYD_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "latitude": 37.3382, "longitude": -121.8863, "accuracy": 12,
    "expected_latitude": 37.3390, "expected_longitude": -121.8850,
    "radius_m": 200
  }'`}
      note={
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm space-y-2">
          <p className="flex items-center gap-2 font-semibold text-foreground">
            <MapPin className="h-4 w-4 text-primary" /> What the status means
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-1 pr-4 font-medium">You send</th>
                  <th className="py-1 pr-4 font-medium">status</th>
                  <th className="py-1 pr-4 font-medium">data.match</th>
                  <th className="py-1 font-medium">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-muted-foreground">
                <tr>
                  <td className="py-1.5 pr-4">expected point <strong>+ radius_m</strong></td>
                  <td className="py-1.5 pr-4"><code>passed</code> / <code>failed</code></td>
                  <td className="py-1.5 pr-4"><code>true</code> / <code>false</code></td>
                  <td className="py-1.5"><strong className="text-foreground">The status is the verdict</strong> — inside / outside the radius.</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4">expected point, no radius</td>
                  <td className="py-1.5 pr-4"><code>passed</code></td>
                  <td className="py-1.5 pr-4"><code>null</code></td>
                  <td className="py-1.5">No threshold given — we just report <code>distance_m</code>; you decide.</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4">no expected point</td>
                  <td className="py-1.5 pr-4"><code>passed</code></td>
                  <td className="py-1.5 pr-4">—</td>
                  <td className="py-1.5">Capture-only: the accurate coordinates + accuracy.</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4">permission blocked / no coords</td>
                  <td className="py-1.5 pr-4"><code>failed</code></td>
                  <td className="py-1.5 pr-4">—</td>
                  <td className="py-1.5">
                    <strong className="text-foreground">Hard fail</strong> — a real fix is mandatory, never skippable.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            Capture a trustworthy fix in the browser with <code>captureLocation()</code> from{" "}
            the browser's native camera + geolocation. Anti-spoof note: Core-API coordinates are client-supplied (your trust
            boundary); the Hosted flow additionally cross-checks the user's real IP against the GPS.
          </p>
        </div>
      }
      responseTitle="data.check"
      response={`// Inside the radius:
{
  "type": "location",
  "status": "passed",
  "score": 137.4,                      // the distance (or the GPS accuracy in capture-only mode)
  "data": {
    "latitude": 37.3382, "longitude": -121.8863, "accuracy": 12,
    "source": "gps", "captured_at": "2026-07-13T18:04:10+00:00",
    "expected_latitude": 37.339, "expected_longitude": -121.885,
    "distance_m": 137.4, "radius_m": 200, "match": true
  }
}

// Outside it — the check FAILS, with a message you can show the user:
{
  "type": "location",
  "status": "failed",
  "error": "You are 119.3 km from the required location (must be within 200 m).",
  "data": { "distance_m": 119300.0, "radius_m": 200, "match": false }
}`}
    />

    {/* Credential discovery */}
    <div className="p-5 rounded-lg border border-border bg-card space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Credential discovery</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Use these endpoints to build state and license-type pickers in your UI before calling
          <code> credential-verification </code> or <code>kyc-credential</code>. A provider's{" "}
          <code>required_fields</code> tells you which license inputs to collect — but always collect first / last name
          even when it isn't listed, because the registry lookup needs it.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">GET</span>
          <code className="text-sm">/api/v2/credential/states</code>
        </div>
        <LanguageTabs
          examples={[
            {
              language: "javascript",
              label: "SDK (Node)",
              code: `const states = await valyd.verify.credentials.states();
// [{ stateName: "California", stateCode: "CA" }, …]`,
            },
            {
              language: "bash",
              label: "cURL",
              code: `curl ${BASE}/api/v2/credential/states \\
  -H "X-API-Key: $VALYD_API_KEY"`,
            },
          ]}
        />
        <CodeBlock
          language="json"
          title="data"
          code={`{ "states": [ { "state_name": "California", "state_code": "CA" } ] }`}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">GET</span>
          <code className="text-sm">/api/v2/credential/states/{`{state}`}/providers</code>
        </div>
        <LanguageTabs
          examples={[
            {
              language: "javascript",
              label: "SDK (Node)",
              code: `const providers = await valyd.verify.credentials.providers("CA");
// [{ providerCode, providerDisplayName, credentialName, requiredFields, … }]`,
            },
            {
              language: "bash",
              label: "cURL",
              code: `curl ${BASE}/api/v2/credential/states/CA/providers \\
  -H "X-API-Key: $VALYD_API_KEY"`,
            },
          ]}
        />
        <CodeBlock
          language="json"
          title="data"
          code={`{
  "providers": [
    {
      "provider_code": "MD",
      "provider_display_name": "Medical Board of California",
      "credential_name": "Physician & Surgeon",
      "required_fields": ["license_number"]
    }
  ]
}`}
        />
      </div>
    </div>

    {/* Errors */}
    <div className="p-5 rounded-lg border border-border bg-card space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Errors</h3>
      <p className="text-sm text-muted-foreground">
        Over HTTP, failures return the envelope <code>{`{ success: false, error: { code, message } }`}</code> with the
        matching HTTP status:
      </p>
      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
        <li><code>401</code> — invalid or missing API key.</li>
        <li><code>400</code> — validation error (missing field, bad image, unknown provider).</li>
        <li><code>404</code> — unknown state or provider.</li>
        <li><code>429</code> — rate limited.</li>
        <li><code>5xx</code> — upstream registry or internal error.</li>
      </ul>
      <p className="text-sm text-muted-foreground">
        In the SDK, the same failures throw <code>ValydVerifyError</code> with{" "}
        <code>{`{ code, status, message }`}</code>. Credential registry lookups can take{" "}
        <strong>10–60 seconds</strong> — configure a generous client timeout.
      </p>
      <CodeBlock
        language="javascript"
        code={`import { Valyd, ValydVerifyError } from "@valyd/sdk";

const valyd = new Valyd({
  apiKey: process.env.VALYD_API_KEY,
  timeoutMs: 90_000, // registry lookups can be slow
});

try {
  const { check } = await valyd.verify.standalone.credentialVerification({
    firstName: "Jane", lastName: "Doe",
    licenseState: "CA", licenseType: "MD", licenseNumber: "A12345",
  });
} catch (err) {
  if (err instanceof ValydVerifyError) {
    console.error(err.status, err.code, err.message);
  } else {
    throw err;
  }
}`}
      />
    </div>

    {/* Recipe card */}
    <Link
      to="/verify/verify-license"
      className="group mt-6 flex items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4 transition-colors hover:border-primary/60 hover:bg-primary/10"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Recipe</p>
        <p className="font-semibold text-foreground">Verify a professional license</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Step-by-step: discover providers, call the credential-verification endpoint, and handle every result status.
        </p>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 text-primary opacity-60 transition-transform group-hover:translate-x-1" />
    </Link>
  </section>
);
