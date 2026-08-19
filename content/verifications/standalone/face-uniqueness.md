# Face uniqueness (dedup)

`POST /api/v2/face-uniqueness` — one face = one Valyd uuid. Enrolls or matches a selfie
against the global gallery and returns the stable `valyd_uuid` plus whether it was newly
registered. Accepts a single `image`/`selfie` (single-frame liveness gate) or `frames[]`
(full live pipeline gate).

**Method:** POST · **Full URL:** `https://idp.valyd.work/api/v2/face-uniqueness` · **Auth:** `X-API-Key`

**Request (SDK, Node):**

```javascript
import { VerifyClient, readImage } from "@valyd/sdk";
const verify = new VerifyClient({ apiKey: process.env.VALYD_API_KEY });

// single-click mode: one selfie (passive liveness gate)…
const { check } = await verify.standalone.faceUniqueness({
  selfie: readImage("./selfie.jpg"),
  externalRef: "user-4812", // optional — your own reference, stored on the enrollment link
});
// …or live mode: frames: [f1, f2, f3] (3–8 burst stills, full live pipeline gate)
// strict projects: also pass challengeId from verify.standalone.antispoofChallenge()
//   — see /verifications/standalone/antispoof#gesture-challenge

console.log(check.data.valyd_uuid, check.data.registered); // "new" | "existing"
```

**Raw HTTP:** [cURL example →](/verifications/standalone/http#face-uniqueness)

**Expected output** (`check.data`):

```json
{ "valyd_uuid": "valyd_8f2…", "registered": "existing" }
```

**Unlink:** `DELETE /api/v2/face-uniqueness/{valyd_uuid}` removes a face from the gallery
(e.g. to clear test data). In the SDK:

```javascript
await verify.standalone.faceUniquenessUnlink("valyd_8f2…");
// → { valyd_uuid, unlinked, deleted } — deleted: true when no project links remain
```
