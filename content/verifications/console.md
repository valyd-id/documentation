# The Developer Portal

## Apps
One app in the Developer Portal carries both identities: the OAuth `client_id` / `client_secret` for **Connect with Valyd**,
and a Verify **API key** (`vrf_…`) for the verification APIs. The API key is shown **once** at creation. Create multiple
apps such as Test and Production.

- The API key is shown **once** at creation. Copy it immediately and store it server-side.
- If lost, rotate the key in the Console to generate a new one.

## Workflows
Bundle checks (ID, liveness, face match, and the other Verify checks) into a reusable Workflow. Each Workflow has a `workflow_id` used when creating verification sessions.

- The `workflow_id` is required as the `workflow_id` field when creating a verification session (see https://docs.valyd.work/verifications/quickstart).

## Webhooks
Configure a per-app endpoint URL and signing secret (rotatable). Valyd POSTs signed events to this URL when a session reaches a terminal state.

- Set both the endpoint URL and the signing secret per App.
- Verify the signature on incoming events using the signing secret before trusting them.

## SSO
The console uses Valyd SSO. Your developer account is separate from end-users you verify.

## Human-only checklist (in the Console)

```text
IF you do not yet have an App API key:
  → Sign in at https://dev.valyd.work with Valyd SSO (one sign-in covers OAuth apps, Verify apps and workflows)
  → Open your App and copy the API key shown once at creation; store it server-side
IF you lost the API key:
  → In the Console, rotate the App API key to generate a new one
IF you will use Reusable Verification:
  → Create a Workflow bundling the checks you need and copy its workflow_id
  → Under Webhooks, set the endpoint URL and copy the signing secret
IF you will use the Unique Human API only:
  → You only need the App API key; Workflows and Webhooks are not required
```
