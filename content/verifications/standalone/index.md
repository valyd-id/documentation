---
product: valyd-verify
sdk_min_version: 1.10.3
billable: true
pii_mode: standalone
human_setup_required: true
source_of_truth: sdk
---

# Unique Human API

> 🔑 **Auth:** App API key (server-side) + a `workflowId` · 👤 **User account:** none · 💾 **Result:** returned to your system, nothing saved to an account

Determine whether you're interacting with a **live, unique human** using your Valyd API
credentials. No user account and no OIDC: you create a session for a workflow that contains the
**Liveness** and/or **Uniqueness** checks, redirect the person to **Valyd's verification page**
(Valyd handles the camera, capture, retries, and security), and read the verdict when they're
done. The result returns to your system — nothing is saved to any Valyd account.

## The flow

1. In the [Developer Portal](https://dev.valyd.work) create a **project** and open its
   **Verification** tab. Build a **workflow** with the checks you need —
   [Liveness](/verifications/standalone/antispoof),
   [Uniqueness](/verifications/standalone/face-uniqueness), or both — then copy the project's API key
   (shown once) and the `workflowId`. (For a quick, no-account anti-spoof check, every organization
   also has a built-in **Verify Fresh** key on the dashboard.)
2. Create a session from your backend — **no user token**:

   ```javascript
   import { VerifyClient } from "@valyd/sdk";
   const verify = new VerifyClient({ apiKey: process.env.VALYD_API_KEY });

   const session = await verify.sessions.create({
     workflowId:  process.env.VALYD_WORKFLOW_ID,  // liveness and/or uniqueness
     redirectUrl: "https://yourapp.com/checked",
     vendorData:  "user-123",                     // your internal ref
   });
   // → redirect the person's browser to session.url
   ```

3. Valyd's page captures a live camera burst (with a random on-screen action for the strongest
   assurance) and sends the person back to your `redirectUrl`.
4. Read the verdict — signed [webhook](/verifications/webhooks) or the decision call:

   ```javascript
   const decision = await verify.sessions.decision(session.sessionId);
   // decision.status: "APPROVED" | "DECLINED" | "IN_REVIEW"
   // decision.checks[] — per-check data:
   //   antispoof       → { human_score: 100, assurance: "captured", ... }
   //   face_uniqueness → { valyd_uuid: "valyd_8f2…", registered: "new" | "existing" }
   ```

Because the session carries no user token, nothing is saved to a Valyd account — the verdict is
yours to act on.

## The two checks

- **[Liveness](/verifications/standalone/antispoof)** — is this a live human in front of the
  camera, not a printout, screen replay, or mask?
- **[Uniqueness](/verifications/standalone/face-uniqueness)** — one face = one identity: the same
  face always resolves to the same stable `valyd_uuid`, so a person opening a second account is
  caught.

## Setup

Portal sign-in works with an **email magic link** as well as a Valyd ID. Create a **project** from
the dashboard, open its **Verification** tab, copy its API key into `VALYD_API_KEY` (server-side
only — never in browser code), build the workflow, and copy its `workflowId`.

---

Need reusable identity or verified credentials — KYC, licenses, face match bound to a user? See
**[Reusable Verification](/verifications)**.
