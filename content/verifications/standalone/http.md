# Raw HTTP (cURL)

Every **Verify Fresh** check is a plain HTTPS endpoint — this page collects the raw requests in one
place for integrations that don't use the [Node SDK](/verifications/sdk) (other languages, testing
from the terminal, codegen). The endpoint pages themselves show only the SDK call; each links back
to its section here.

> ID/KYC, face match, age, professional license, and location are no longer self-serve direct
> calls — they run through [Managed by Valyd](/verifications/managed) (a signed-in user's hosted
> session). The endpoints below are the Verify Fresh checks: liveness, anti-spoof, and face
> uniqueness.

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

---

**Need ID/KYC, face match, age, professional license, or location?** Those run through
[Managed by Valyd](/verifications/managed) on a signed-in user's hosted session, not as direct
cURL calls.
