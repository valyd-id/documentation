# API Reference

## Agent Quick-Start
- Source URL: https://docs.valyd.work/verify#api-sessions
- Credentials / env vars needed: VALYD_API_KEY (your App API key, sent as the `X-API-Key` header)
- Files an integrator edits: none — reference only (server code uses these endpoints)
- Estimated steps: 0
- Can complete without human input: YES — this is a reference page; no actions required.
- Prerequisites:
  - An App API key from the Valyd Developer Portal (https://dev.valyd.work)
  - For workflow-based sessions, a `workflow_id` configured in the Developer Portal

Base URL for all endpoints: `https://idp.valyd.work`

### Authentication (applies to every call)
Every call uses the header:

```http
X-API-Key: <App API key>
```

A Bearer token is also accepted:

```http
Authorization: Bearer <App API key>
```

Get your App API key from the Valyd Developer Portal (https://dev.valyd.work). Authenticated endpoints are billed per call against your App.

## Sessions

| Method | Path                              | Description                                          |
|--------|-----------------------------------|------------------------------------------------------|
| POST   | `/api/v2/session`                 | Create a hosted verification session                 |
| GET    | `/api/v2/session`                 | List sessions                                        |
| GET    | `/api/v2/session/{id}`            | Retrieve a session                                   |
| PATCH  | `/api/v2/session/{id}/status`     | Manual override: `{ status: APPROVED | DECLINED }`   |

### POST /api/v2/session — create a hosted verification session

Full URL: `https://idp.valyd.work/api/v2/session`

```bash
curl -X POST https://idp.valyd.work/api/v2/session \
  -H "X-API-Key: $VALYD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "workflow_id": "WORKFLOW_ID", "vendor_data": "user-123" }'
```

`workflow_id` (get it from the Developer Portal: https://dev.valyd.work) selects the bundle of services to run. `vendor_data` is your own correlation string, echoed back on webhooks and the decision.

**Expected output:** HTTP 200/201 with a created session object including its session id and a hosted verification URL to send the user to.

### GET /api/v2/session — list sessions

Full URL: `https://idp.valyd.work/api/v2/session`

```bash
curl https://idp.valyd.work/api/v2/session \
  -H "X-API-Key: $VALYD_API_KEY"
```

**Expected output:** HTTP 200 with a list of session objects.

### GET /api/v2/session/{id} — retrieve a session

Full URL: `https://idp.valyd.work/api/v2/session/{id}`

```bash
curl https://idp.valyd.work/api/v2/session/SES_ID \
  -H "X-API-Key: $VALYD_API_KEY"
```

**Expected output:** HTTP 200 with the session object, including its current `status` (see statuses.md for all values).

### PATCH /api/v2/session/{id}/status — manual override

Full URL: `https://idp.valyd.work/api/v2/session/{id}/status`

Manually force a terminal decision. Body must set `status` to `APPROVED` or `DECLINED`.

```bash
curl -X PATCH https://idp.valyd.work/api/v2/session/SES_ID/status \
  -H "X-API-Key: $VALYD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "status": "APPROVED" }'
```

**Expected output:** HTTP 200 with the updated session reflecting the overridden status.

## Workflows

Workflows are configured in the Developer Portal (https://dev.valyd.work). A workflow bundles services and exposes a stable `workflow_id` that you pass when creating a session.

Available services that a workflow can bundle:
- `id_verification`
- `liveness`
- `face_match`
- `age`
- `credential`

There is no REST endpoint to create a workflow from this reference — workflows are defined in the Developer Portal, and you reference the resulting `workflow_id` in `POST /api/v2/session`.

## Core checks

Run a single check directly without a hosted session.

| Method | Path                                      | Description                              |
|--------|-------------------------------------------|------------------------------------------|
| POST   | `/api/v2/id-verification`                 | OCR + authenticity from a government ID  |
| POST   | `/api/v2/liveness`                        | Passive liveness from a selfie           |
| POST   | `/api/v2/face-match`                      | Selfie vs reference portrait             |
| POST   | `/api/v2/age-verification`                | Age bands from a DOB                     |
| POST   | `/api/v2/credential-verification`         | Professional license lookup              |

Each is called with the `X-API-Key` header. Example:

```bash
curl -X POST https://idp.valyd.work/api/v2/id-verification \
  -H "X-API-Key: $VALYD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "...": "service-specific input" }'
```

**Expected output:** HTTP 200 with the check result, including a per-check status of `passed`, `failed`, or `review` (see statuses.md).

Full URLs:
- `https://idp.valyd.work/api/v2/id-verification`
- `https://idp.valyd.work/api/v2/liveness`
- `https://idp.valyd.work/api/v2/face-match`
- `https://idp.valyd.work/api/v2/age-verification`
- `https://idp.valyd.work/api/v2/credential-verification`

## Decision

| Method | Path                                | Description                       |
|--------|-------------------------------------|-----------------------------------|
| GET    | `/api/v2/session/{id}/decision`     | Full decision and per-check data  |

Full URL: `https://idp.valyd.work/api/v2/session/{id}/decision`

```bash
curl https://idp.valyd.work/api/v2/session/SES_ID/decision -H "X-API-Key: $VALYD_API_KEY"
```

**Expected output:** HTTP 200 with the full decision and per-check data for the session. Call this after a terminal webhook to retrieve all extracted data (the webhook is only a notification).

## POST /api/v2/location — the location check

A **real GPS fix is always mandatory**. This step can never be skipped: a blocked permission or
missing coordinates is a hard `failed` (never a pass, never a review).

What the `status` means depends on what you asked for:

| You send | `status` | `data.match` | Notes |
| --- | --- | --- | --- |
| `expected_latitude` + `expected_longitude` + `radius_m` | **`passed` inside the radius, `failed` outside it** | `true` / `false` | The status **is** the verdict. `error` reads e.g. `"You are 119.3 km from the required location (must be within 200 m)."` |
| `expected_latitude` + `expected_longitude`, **no** `radius_m` | `passed` | `null` | We cannot judge without a threshold — we just report `data.distance_m`; you decide. |
| No expected point | `passed` | absent | Capture-only: returns the captured coordinates + accuracy. |

Request:

```bash
curl -X POST https://idp.valyd.work/api/v2/location \
  -H "X-API-Key: $VALYD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 37.3382, "longitude": -121.8863, "accuracy": 12,
    "expected_latitude": 37.3390, "expected_longitude": -121.8850,
    "radius_m": 200
  }'
```

Response (`data.check`):

```json
{
  "type": "location",
  "status": "passed",
  "score": 137.4,
  "data": {
    "latitude": 37.3382, "longitude": -121.8863, "accuracy": 12,
    "source": "gps", "captured_at": "2026-07-13T18:04:10+00:00",
    "expected_latitude": 37.339, "expected_longitude": -121.885,
    "distance_m": 137.4, "radius_m": 200, "match": true
  }
}
```

Outside the radius the same call returns `"status": "failed"`, `"match": false` and the human-readable
`error`. There is no separate `location-match` endpoint and no `evv_presence` bundle — `location` is the
single location check (feature key `location`), and it does the geofence verdict itself.

```text
IF you need a yes/no "is the user at the place?":  → send expected_latitude + expected_longitude + radius_m and read `status`
IF you only want the distance:                     → send the expected point WITHOUT radius_m and read `data.distance_m`
IF you only want the coordinates:                  → send just latitude/longitude/accuracy
IF status is failed with reason permission_denied: → the user blocked location; ask them to allow it and retry (it cannot be skipped)
```

## Errors & rate limits

Errors use the same response envelope with `success: false` and an HTTP status that reflects the error class.

```json
{
  "success": false,
  "error": { "code": "invalid_api_key", "message": "API key is missing or invalid" }
}
```

| HTTP | Code               | When                                                 |
|------|--------------------|------------------------------------------------------|
| 400  | `validation_error` | Malformed body or missing required field             |
| 401  | `invalid_api_key`  | Missing/invalid `X-API-Key` header                   |
| 404  | `not_found`        | Session or resource does not exist                   |
| 422  | `unprocessable`    | Could not process the input (e.g. unreadable image)  |
| 429  | `rate_limited`     | Public/demo endpoints rate limit exceeded            |
| 500  | `internal_error`   | Unexpected server error — safe to retry              |

Rate limits and billing:
- Authenticated endpoints are billed per call against your App.
- Public/demo endpoints return HTTP 429 with `code: "rate_limited"` when limits are exceeded.

### Decision tree — handling an error response

```text
IF HTTP 400 (validation_error):  → fix the request body / add the missing required field, then retry.
IF HTTP 401 (invalid_api_key):   → set the X-API-Key header to a valid App API key (from https://dev.valyd.work); do not retry until fixed.
IF HTTP 404 (not_found):         → verify the session/resource id; do not retry the same id.
IF HTTP 422 (unprocessable):     → the input could not be processed (e.g. unreadable image); collect new/clearer input and retry.
IF HTTP 429 (rate_limited):      → back off and retry later; you have exceeded public/demo limits.
IF HTTP 500 (internal_error):    → safe to retry (with backoff).
```
