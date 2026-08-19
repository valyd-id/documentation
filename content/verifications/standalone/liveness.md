# Liveness

`POST /api/v2/liveness` — passive liveness check. Passes when `live_score === 1`.

**Method:** POST
**Full URL:** `https://idp.valyd.work/api/v2/liveness`
**Auth header:** `X-API-Key: <App API key>`

**Fields:**
- `image` (image) **required** — A selfie. File, Buffer, or base64/data-URL.

**Request (SDK, Node):**

```javascript
import { VerifyClient, readImage } from "@valyd/sdk";
const verify = new VerifyClient({ apiKey: process.env.VALYD_API_KEY });

const { check } = await verify.standalone.liveness({
  image: readImage("./selfie.jpg"),
});
// check.status === "passed" when check.data.live_score === 1
```

**Raw HTTP:** [cURL example →](/verifications/standalone/http#liveness)

**Expected output:** HTTP 200 with the standard envelope (`success: true`); `check.type` is `"liveness"`. `check.status === "passed"` when `live_score === 1`. `check.data` is:

```json
{
  "live_score": 1,
  "result": "live"
}
```

`live_score` values: `1` = live, `0` = spoof, `< 0` = no face detected.
