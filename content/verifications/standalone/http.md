# Raw HTTP (cURL)

Every standalone check is a plain HTTPS endpoint — this page collects the raw requests in one
place for integrations that don't use the [Node SDK](/verifications/sdk) (other languages, testing
from the terminal, codegen). The endpoint pages themselves show only the SDK call; each links back
to its section here.

Applies to every request below:

- **Base URL:** `https://idp.valyd.work`
- **Auth header:** `X-API-Key: <App API key>` — never from a browser.
- **Images:** send as multipart files (`-F "field=@./file.jpg"`) or as base64 strings in a JSON body under the same field name.
- **Responses:** the [standard envelope](/verifications/standalone#overview) with a `check` object.

## Idempotency header

Every billable `POST /api/v2/*` accepts an `Idempotency-Key` header ([how it behaves](/verifications/standalone#idempotency)).
In the SDK, pass `idempotencyKey` on any billable check and this header is sent for you (v1.10.2+):

```bash
curl -X POST https://idp.valyd.work/api/v2/liveness \
  -H "X-API-Key: $VALYD_API_KEY" \
  -H "Idempotency-Key: 5f2c…-your-unique-id" \
  -F "image=@./selfie.jpg"
```

## ID verification

[Endpoint page →](/verifications/standalone/id-verification)

```bash
curl -X POST https://idp.valyd.work/api/v2/id-verification \
  -H "X-API-Key: $VALYD_API_KEY" \
  -F "front_image=@./id_front.jpg" \
  -F "back_image=@./id_back.jpg"
```

## Liveness

[Endpoint page →](/verifications/standalone/liveness)

```bash
curl -X POST https://idp.valyd.work/api/v2/liveness \
  -H "X-API-Key: $VALYD_API_KEY" \
  -F "image=@./selfie.jpg"
```

## Anti-spoof (single image or burst)

[Endpoint page →](/verifications/standalone/antispoof)

```bash
curl -X POST https://idp.valyd.work/api/v2/antispoof \
  -H "X-API-Key: $VALYD_API_KEY" \
  -F "frames[]=@./f1.jpg" -F "frames[]=@./f2.jpg" -F "frames[]=@./f3.jpg" \
  -F "frames[]=@./f4.jpg" -F "frames[]=@./f5.jpg"
```

Single still instead of a burst: send one `-F "image=@./selfie.jpg"`.

## Gesture challenge

[How challenges work →](/verifications/standalone/antispoof#gesture-challenge)

```bash
curl -X POST https://idp.valyd.work/api/v2/antispoof/challenge \
  -H "X-API-Key: $VALYD_API_KEY"
```

Returns `data: { "challenge_id": "…", "challenge": "turn_head", "expires_in": 60 }` —
single-use, 60s. Echo it back as a `challenge_id` field on the antispoof / face-uniqueness run:

```bash
curl -X POST https://idp.valyd.work/api/v2/antispoof/identity \
  -H "X-API-Key: $VALYD_API_KEY" \
  -F "challenge_id=<challenge_id>" \
  -F "frames[]=@./f1.jpg" -F "frames[]=@./f2.jpg" -F "frames[]=@./f3.jpg"
```

## Anti-spoof + identity

[Endpoint page →](/verifications/standalone/antispoof#post-apiv2antispoofidentity--anti-spoof--identity)

Same input as `/antispoof`, different path:

```bash
curl -X POST https://idp.valyd.work/api/v2/antispoof/identity \
  -H "X-API-Key: $VALYD_API_KEY" \
  -F "frames[]=@./f1.jpg" -F "frames[]=@./f2.jpg" -F "frames[]=@./f3.jpg"
```

## Face uniqueness

[Endpoint page →](/verifications/standalone/face-uniqueness)

```bash
curl -X POST https://idp.valyd.work/api/v2/face-uniqueness \
  -H "X-API-Key: $VALYD_API_KEY" \
  -F "selfie=@./selfie.jpg"
```

Unlink a face (e.g. to clear test data):

```bash
curl -X DELETE https://idp.valyd.work/api/v2/face-uniqueness/valyd_8f2… \
  -H "X-API-Key: $VALYD_API_KEY"
```

## Location

[Endpoint page →](/verifications/standalone/location)

```bash
curl -X POST https://idp.valyd.work/api/v2/location \
  -H "X-API-Key: $VALYD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "latitude": 34.0522, "longitude": -118.2437, "accuracy": 12,
        "expected_latitude": 34.0511, "expected_longitude": -118.244, "radius_m": 250 }'
```

## Face match

[Endpoint page →](/verifications/standalone/face-match)

```bash
curl -X POST https://idp.valyd.work/api/v2/face-match \
  -H "X-API-Key: $VALYD_API_KEY" \
  -F "image1=@./id_portrait.jpg" \
  -F "image2=@./selfie.jpg"
```

## Age verification

[Endpoint page →](/verifications/standalone/age-verification)

```bash
curl -X POST https://idp.valyd.work/api/v2/age-verification \
  -H "X-API-Key: $VALYD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "dob": "1995-06-01", "bands": ["is_18_plus","is_21_plus"] }'
```

## Credential verification

[Endpoint page →](/verifications/standalone/credential-verification)

```bash
curl -X POST https://idp.valyd.work/api/v2/credential-verification \
  -H "X-API-Key: $VALYD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name":  "Doe",
    "license_type":   "MD",
    "license_state":  "CA",
    "license_number": "A12345",
    "npi": "1234567890"
  }'
```

Registry lookups can take 10–60s — add `--max-time 90`.

## Credential discovery

[Endpoint page →](/verifications/standalone/credential-verification#credential-discovery)

```bash
curl https://idp.valyd.work/api/v2/credential/states \
  -H "X-API-Key: $VALYD_API_KEY"
```

```bash
curl https://idp.valyd.work/api/v2/credential/states/CA/providers \
  -H "X-API-Key: $VALYD_API_KEY"
```

## KYC + credential

[Endpoint page →](/verifications/standalone/kyc-credential)

```bash
curl -X POST https://idp.valyd.work/api/v2/kyc-credential \
  -H "X-API-Key: $VALYD_API_KEY" \
  -F "front_image=@./id_front.jpg" \
  -F "selfie=@./selfie.jpg" \
  -F "license_type=MD" \
  -F "license_state=CA" \
  -F "license_number=A12345"
```

Registry lookups can take 10–60s — add `--max-time 90`.
