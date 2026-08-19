# Liveness

> 🔑 **Auth:** API key + the user's `valyd_access_token` · ✅ Proves: a live person, not a photo, screen, or replay · 💾 Assurance rides on their account

Confirms the selfie (or a short frame burst) comes from a live human in front of the camera:

```typescript
const result = await verify.standalone.liveness({
  selfie,                          // one image — or frames: [...] for a burst
  valydAccessToken: accessToken,
});
// result.status: "passed" | "failed" — live score in result.data
```

`POST /api/v2/liveness` — full parameters in the
[endpoint reference](/verifications/standalone/liveness).

**When to use it:** pair it with [face match](/docs/user-token/face-match) — liveness answers
"is this a real person", face match answers "is it *this* person". Hosted workflows run both as
gates automatically.
