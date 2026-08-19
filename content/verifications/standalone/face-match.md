# Face Match

`POST /api/v2/face-match` — compare two images. Passes when similarity ≥ threshold (default ~0.95).

**Method:** POST
**Full URL:** `https://idp.valyd.work/api/v2/face-match`
**Auth header:** `X-API-Key: <App API key>`

**Fields:**
- `image1` (image) **required** — Reference image (typically the ID portrait).
- `image2` (image) **required** — Selfie to compare against the reference.

**Request (SDK, Node):**

```javascript
import { VerifyClient, readImage } from "@valyd/sdk";
const verify = new VerifyClient({ apiKey: process.env.VALYD_API_KEY });

const { check } = await verify.standalone.faceMatch({
  idImage: readImage("./id_portrait.jpg"),
  selfie:  readImage("./selfie.jpg"),
});
// check.data.similarity, check.data.threshold
```

**Raw HTTP:** [cURL example →](/verifications/standalone/http#face-match)

**Expected output:** HTTP 200 with the standard envelope (`success: true`); `check.type` is `"face_match"`. `check.data` is:

```json
{ "similarity": 0.973, "threshold": 0.95 }
```
