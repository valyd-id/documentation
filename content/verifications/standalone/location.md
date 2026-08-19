# Location

`POST /api/v2/location` — records/validates a geolocation fix for a session (used by
workflows like EVV).

**Method:** POST · **Full URL:** `https://idp.valyd.work/api/v2/location` · **Auth:** `X-API-Key`

**Fields:** `latitude`, `longitude` (numbers) **required**; optional `accuracy` (metres).
Optionally add an expected point — `expected_latitude`, `expected_longitude`, and `radius_m`
(metres) — to turn the capture into a verdict.

**Request (SDK, Node):**

```javascript
import { VerifyClient } from "@valyd/sdk";
const verify = new VerifyClient({ apiKey: process.env.VALYD_API_KEY });

const { check } = await verify.standalone.locationMatch({
  latitude: 34.0522,           // where the person actually is
  longitude: -118.2437,
  accuracy: 12,                // optional, metres
  expectedLatitude: 34.0511,   // optional — where they should be
  expectedLongitude: -118.244,
  radiusM: 250,                // optional — allowed radius in metres
});
// check.data.match, check.data.distance_m
```

**Raw HTTP:** [cURL example →](/verifications/standalone/http#location)

What `status` means depends on what you ask for:

- expected point + `radius_m` → the status **is** the verdict: `passed` inside the radius,
  `failed` outside it (`data.match` is the boolean, `data.distance_m` the distance).
- expected point, no `radius_m` → `passed`, and `data.distance_m` is reported
  (`data.match` is null) — you decide what "close enough" means.
- no expected point → capture-only: `passed`, with the accurate captured coordinates.

A real GPS fix is always required — a blocked permission or missing coordinates is a hard
`failed`, and in the hosted flow the user cannot skip the step.
