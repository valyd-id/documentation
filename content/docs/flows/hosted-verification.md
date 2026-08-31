# Verification session flow

> 📄 **This page moved.** Running a verification session is now documented in one canonical
> place: **[Run a verification](/verifications/quickstart)**. This stub stays so old links keep
> working.

A **verification session** runs the checks your workflow defines with **no UI to build**: your
backend calls `verify.sessions.create({ workflowId, valydAccessToken, redirectUrl })`, you send
the person to Valyd's verification page, and the result comes back as a signed webhook plus an
authoritative decision API. Valyd owns the capture UX (camera, retries, anti-spoofing), and
passed proofs save to the connected user's Valyd ID — reusable next time.

## Read the canonical guide

- **Run a verification** (full guide — SDK code, webhooks, decision reading, statuses): [`/verifications/quickstart`](/verifications/quickstart)
- The full journey around it: [Reusable Verification](/verifications)
- Pick the checks a session runs: [Workflows](/verifications/workflows)
- What each status means: [Decisions & statuses](/verifications/statuses)
- Liveness / uniqueness with an API key alone: [Unique Human API](/verifications/unique-human)
