# Face match

> 🔑 **Auth:** API key + the user's `valyd_access_token` · ✅ Proves: the person on your screen is the account holder · 💾 Result rides on their account

The selfie you capture is matched against the face vector already enrolled on the user's Valyd
account — only the selfie leaves your server, never a reference image.

```typescript
const result = await verify.standalone.faceMatch({
  selfie,                          // the image you just captured
  valydAccessToken: accessToken,   // matches against THEIR enrolled face
});
// result.status: "passed" | "failed" — similarity + threshold in result.data
```

`POST /api/v2/face-match` — full parameters and response shape in the
[endpoint reference](/verifications/standalone/face-match).

**When to use it:** step-up before a sensitive action, shift check-in, proving the session
holder is the account holder. For "is this a live person at all", see
[Liveness](/docs/user-token/liveness).
