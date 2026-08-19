# ID Verification

`POST /api/v2/id-verification` — OCR + authenticity from a government ID.

**Method:** POST
**Full URL:** `https://idp.valyd.work/api/v2/id-verification`
**Auth header:** `X-API-Key: <App API key>`

**Fields:**
- `front_image` (image) **required** — Front of the ID. File, Buffer, or base64/data-URL.
- `back_image` (image) — Back of the ID (when applicable).

**Request (SDK, Node):**

```javascript
import { VerifyClient, readImage } from "@valyd/sdk";
const verify = new VerifyClient({ apiKey: process.env.VALYD_API_KEY });

const { check } = await verify.standalone.idVerification({
  frontImage: readImage("./id_front.jpg"),
  backImage:  readImage("./id_back.jpg"), // optional
});

console.log(check.data.fields.full_name, check.data.fields.document_number);
```

**Raw HTTP:** [cURL example →](/verifications/standalone/http#id-verification)

**Expected output:** HTTP 200 with the standard envelope (`success: true`); `check.type` is `"id_verification"` and `check.data` is:

```json
{
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
}
```
