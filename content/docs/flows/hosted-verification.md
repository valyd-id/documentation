# Hosted verification flow

> 📄 **This page moved.** Hosted verification is now documented in one canonical place:
> **[Hosted verification](/verifications/hosted)**. This stub stays so old links keep working.

**Hosted verification** runs a KYC or license check with **no UI to build**: your backend creates
a session, you send the person to Valyd's capture page, and the result comes back as a signed
webhook plus an authoritative decision API. This is the **Hosted** delivery mode — Valyd owns the
capture UX (camera, retries, anti-spoofing). Delivery is a separate axis from data ownership:
include the signed-in user's `valyd_access_token` when creating the session and passed proofs save
to their Valyd ID ([Reusable Identity](/verifications/managed)); omit it and the same session runs
as a one-off standalone check.

## Read the canonical guide

- **Hosted verification** (full guide — SDK code, webhooks, decision reading, statuses): [`/verifications/hosted`](/verifications/hosted)
- Save results to the user's account instead: [Verify & save a new proof](/verifications/managed)
- Pick the checks a session runs: [Workflows](/verifications/workflows)
- What each status means: [Decisions & statuses](/verifications/statuses)
- Call the API directly with your own UI: [Direct API Checks](/verifications/standalone)
