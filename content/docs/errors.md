# Errors & troubleshooting

Every Valyd error is machine-readable: a stable `code` string plus an HTTP status, and every
response carries an `X-Request-Id` header — quote it to support (never API keys or tokens). Read the
status first (it tells you the *category*), then the code (the *exact* cause).

## Contacting support

Include: the **`X-Request-Id`** header value, the session/event id if relevant, a timestamp, and
the endpoint called. **Never send** API keys, tokens, or the person's identity data — support
will never ask for them.

## 1. Error shapes

**Login / account APIs** (`/api/auth/...`) return the envelope:

```json
{ "success": false, "error": { "code": "invalid_token", "message": "Session expired. Please login again." } }
```

**OIDC token endpoint** (`/api/auth/oidc/token`) returns standard top-level OAuth errors:

```json
{ "success": false, "error": { "code": "invalid_grant", "message": "Invalid or expired authorization code" } }
```

**Verification API** (`/api/v2/...`) errors carry the code in `error` with check context where
relevant.

## 2. What the HTTP status means

| Status | Category | Typical causes |
| --- | --- | --- |
| `400` | Bad request | Missing/malformed parameter, invalid scope, expired code |
| `401` | Not authenticated | Wrong `client_id`/secret, missing/expired token, bad API key |
| `402` | Payment required | Wallet balance / quota exhausted — top up in the console |
| `403` | Not allowed | Missing scope, app not permitted for this user, consent declined |
| `404` | Not found | Wrong workflow/session/resource id, or it belongs to another project |
| `409` | Conflict | Duplicate — e.g. the member already exists on your roster |
| `410` | Gone | Removed legacy endpoint (TPSSO) — migrate to `/api/auth/oidc/*` |
| `422` | Rejected input | Image/selfie quality, face rescan required, validation failure |
| `429` | Rate limited | Too many requests — back off and retry after the window |
| `5xx` | Our side | Retry with backoff; if it persists, contact support |

## 3. Complete code catalog

<!-- ERROR-CATALOG:START -->
_Generated from the API source — 147 codes. Do not edit by hand; run `node scripts/gen-error-catalog.mjs`._

| Code | HTTP | Meaning / fix |
| --- | --- | --- |
| `access_denied` | 403 | The user declined, or the app is not permitted for this account. |
| `account_dob_unavailable` | 422 | This Valyd account has no verified date of birth. |
| `account_not_found` | 404 | No Valyd account matches that token. |
| `activation_failed` | 500, 503 | Activation failed. |
| `already_exists` | 409 | E2E encryption is already active for this device |
| `already_paired` | 409 | This device is already paired and has E2E keys |
| `app_default_protected` | 422 | The default app cannot be deleted. Set another app as default first. |
| `back_image_not_found` | 404 | Back image not found |
| `cache_clear_failed` | 400 | Failed to clear caches:  |
| `callback_not_allowed` | 422 | callback must exactly match an active, approved HTTPS webhook destination for this project. |
| `challenge_expired` | 400 | The liveness instruction expired — please try again. |
| `challenge_required` | 400 | This device must complete challenge flow before login. Call POST /api/auth/face/challenge, then send c, d, s, and face_image. |
| `client_not_found` | 404 | Client not found |
| `code_expired` | 410 | The one-time code has expired |
| `database_error` | 500 | Failed to store device keys |
| `decrypt_failed` | 500 | Could not open the managed payload |
| `deletion_failed` | 500 | Could not delete your account. Please try again. |
| `denied` | 403 | User denied the request |
| `device_already_paired` | 409 | This device is already paired |
| `device_key_unknown` | 410 | This browser's device key is no longer registered. Please register this device again. |
| `device_mismatch` | 400 | device_id does not match |
| `device_not_found` | 404 | Device not registered or not linked to a user |
| `empty_face_feature` | 400 | Empty face feature from SDK |
| `endpoint_not_found` | — |  |
| `endpoint_removed` | 410 | You are calling a removed legacy TPSSO endpoint — migrate to /api/auth/oidc/*. |
| `engine_unreachable` | 503 | Verification engine did not respond. Please retry. |
| `expired` | 410 | Request expired |
| `face_feature_extraction_failed` | 400 | Failed to extract face features |
| `face_match_failed` | 500 | Face match failed |
| `face_match_unavailable` | 502 | Could not verify your selfie right now. Please try again. |
| `face_mismatch` | 403 | Face did not match |
| `face_not_enrolled` | 409 | No face is enrolled on this account |
| `face_not_matched` | 403 | Face does not match logged-in user |
| `face_not_verified` | 403 | Face was not verified for this tracking ID |
| `face_required` | 409 | A face check is required to release identity data |
| `face_rescan_required` | 422 | We could not confidently recognize you. Please rescan your face. |
| `failed_to_extract_id_portrait_feature` | — |  |
| `feature_extraction_failed` | 400 | Feature extraction failed |
| `feature_failed` | 502 | Feature extraction failed |
| `feature_size_mismatch` | — |  |
| `forbidden` | 403 | Invalid internal auth |
| `frames_required` | 400 | The demo needs a 3-8 frame live burst from your camera. |
| `front_image_id_required` | 400 | front_image_id is required |
| `front_image_not_found` | 404 | Front image not found |
| `idempotency_in_progress` | 409 | A request with this Idempotency-Key is still being processed. Retry shortly. |
| `idempotency_key_reused` | 422 | This Idempotency-Key was already used with a different request body. |
| `identity_locked` | 403 | Your identity is verified. Only your email and phone number can be changed. Contact support if something else is wrong. |
| `image_not_found` | 404 | Image not found |
| `image_too_large` | 413 | That photo is too large to upload. Please use a smaller image (under 20 MB). |
| `insufficient_scope` | 403 | The access token lacks a required scope (openid is required for OIDC resource calls). |
| `invalid_activation` | 404 | This activation link is invalid or has expired. |
| `invalid_api_key` | 401 | Invalid verification API key. |
| `invalid_audience` | — |  |
| `invalid_challenge` | 403 | Invalid or expired challenge, or signature verification failed |
| `invalid_challenge_result` | 403 | Invalid challenge result |
| `invalid_client` | 401 | Check client_id/client_secret and that the app is active in the Developer Portal. |
| `invalid_client_metadata` | 400 | client_name must be between 1 and 120 characters |
| `invalid_config` | 500 | AGENT_API_KEY not configured |
| `invalid_date` | 400 | Invalid expire_at format |
| `invalid_feature` | 400 | Invalid face vector |
| `invalid_frames` | 400 | Live verification needs at least 3 frames; send one `selfie` for single-click mode. |
| `invalid_grant` | 400, 401 | Code/refresh token expired, already used, or issued to another client — restart the flow. |
| `invalid_idp_response` | — |  |
| `invalid_image` | 400, 422 | A selfie is required. |
| `invalid_recovery_phrases` | 403 | Invalid recovery phrases |
| `invalid_redirect_uri` | 400 | redirect_uris (non-empty array) is required |
| `invalid_request` | 400, 401, 404, 422 | A required parameter is missing or malformed — compare against the reference. |
| `invalid_scope` | 400 | Enable the scope for your app in the Developer Portal before requesting it. |
| `invalid_session` | 400 | Session has no user_ref (pollus_id) |
| `invalid_state` | 409 | Share request already decided |
| `invalid_status` | 400 | Invalid status |
| `invalid_token` | 401, 403 | Token missing/expired — refresh it or sign the user in again. |
| `kyc_required` | 400 | Complete ID verification before verifying the license. |
| `legacy_ocr_failed` | — |  |
| `license_not_found` | 400, 404 | CPR license not found |
| `limit_reached` | 422 | Vault item limit reached |
| `liveness_unavailable` | 502 | Could not check your selfie right now. Please try again. |
| `logo_invalid` | 422 | Logo must be an image data URL. |
| `logo_too_large` | 422 | Logo image is too large. Please use a smaller file. |
| `misconfigured` | 500 | Invalid signing key |
| `misconfigured_oidc_endpoints` | — |  |
| `missing_dob` | 400 | A date of birth is required (provide `dob` or run id-verification first). |
| `missing_document` | 400 | Upload a selfie before running liveness. |
| `missing_parameter` | 400 | Provide valyd_id or vendor_data. |
| `no_existing_e2e` | 400 | User has no existing E2E keys. Use bootstrap/complete for first device setup. |
| `no_face` | 422 | No usable face detected in the selfie |
| `no_images_provided` | 400 | At least one image (front or back) is required |
| `no_reusable_record` | 400 | No reusable verification found — please verify fully. |
| `no_verification` | 404 | This app has no verification set up yet. Open Verification in the dev console once to provision it. |
| `not_found` | 404 | User not found |
| `not_linked` | 400 | Sign in with Valyd before reusing your identity. |
| `otp_expired` | 410 | This OTP has expired |
| `otp_invalid` | 400 | Invalid OTP |
| `otp_not_found` | 404 | Invalid OTP |
| `pairing_already_exchanged` | 409 | Tokens have already been issued for this pairing |
| `pairing_already_fulfilled` | 409 | This pairing request has already been fulfilled |
| `pairing_expired` | 410 | Pairing request has expired |
| `pairing_incomplete` | 400 | Pairing request is missing Device B public key. Device B must provide its public key first. |
| `pairing_not_found` | 404 | Pairing request not found |
| `pairing_not_fulfilled` | 400 | Pairing is not yet complete. Status:  |
| `portrait_invalid` | — |  |
| `portrait_not_found` | — |  |
| `rate_limited` | 429 | Back off and retry after the window resets. |
| `recovery_phrases_not_set` | 404 | Recovery phrases not set for this user |
| `registration_failed` | 500 | Registration failed. Please try again. |
| `required_face_checks_incomplete` | 409 | Approval requires passed ID verification, liveness, and face match checks. |
| `requires_login` | 401 | User must authenticate first |
| `reuse_not_available` | 400 | Your Valyd account is no longer verified — please complete the full verification. |
| `review_not_pending` | 409 | Only an IN_REVIEW session can be manually decided. |
| `sdk_compare_failed` | — |  |
| `server_error` | 500 | Unexpected error |
| `session_closed` | 409 | This verification session is already closed. |
| `session_expired` | 410 | Verification session has expired |
| `session_not_found` | — | Wrong or expired session id. |
| `sso_error` | 500 | Sign-in failed. Please try again. |
| `sso_exchange_failed` | 401 | Could not complete sign-in with Valyd. |
| `sso_no_identity` | 422 | Valyd did not return any account identity. |
| `sso_not_configured` | 503 | Valyd SSO is not configured on this server. |
| `stored_reference_invalid` | — |  |
| `stored_reference_invalid_type` | — |  |
| `tamper_detected` | 409 | payload_hash does not match the server-signed attestation |
| `token_error` | 500 | Could not issue tokens |
| `token_issuance_failed` | 500 | Token issuance failed |
| `token_missing` | 401 | Session token is required. |
| `too_many_attempts` | 429 | Too many failed face checks |
| `too_many_frames` | 400 | At most 8 frames are accepted. |
| `tracking_already_used` | 403 | Tracking ID has already been used |
| `tracking_expired` | 403 | Tracking ID has expired |
| `tracking_not_found` | 404 | Tracking ID not found or invalid |
| `unauthenticated` | 401 | Account not found. |
| `unauthorized` | 401, 403 | Not authorized. |
| `unauthorized_client` | 403 | This app is not active. |
| `unauthorized_domain` | 403 | Unauthorized domain |
| `unknown_band` | — |  |
| `unsupported_grant_type` | 400 | only authorization_code supported |
| `unsupported_response_type` | 400 | Only response_type=code is supported |
| `user_deleted` | 410 | This device was linked to a deleted account. Please clear your local data and register again. |
| `user_has_no_face_reference` | — |  |
| `user_not_found` | 400, 404 | User not found |
| `userinfo_failed` | — |  |
| `valyd_account_mismatch` | 403 | This verification belongs to a different Valyd account. Sign in as that account to continue. |
| `valyd_login_required` | 401 | Sign in to your Valyd account to continue this verification. |
| `verification_soft_locked` | 423 | Verification is temporarily locked. Please contact support. |
| `wc_error` | 400 | WC API error |
| `workflow_not_found` | 404 | The workflow id does not belong to this project — copy it from the portal. |
| `wrapped_ku_recovery_not_set` | 404 | WrappedKuRecovery not set for this user |
| `wrong_endpoint` | 400 | This endpoint expects image IDs, not file uploads. Use the file upload endpoint instead. |
<!-- ERROR-CATALOG:END -->

## 4. Troubleshooting the common integration mistakes

**State mismatch on the callback.** The `state` on your callback must equal the one you stored
before redirecting (the button stores it in the `valyd_oidc_state` cookie; the SDK transaction
carries it). If it differs, the login is forged or expired — restart the flow. Never skip this
check.

**`invalid_grant` on token exchange.** Authorization codes are single-use and expire in ~2
minutes, and are bound to your client and `redirect_uri`. Exchange immediately, exactly once,
with the same `redirect_uri` you authorized with.

**Redirect URI mismatch.** URIs are matched **exactly** — scheme, host, port, and path. Register
every environment's callback in the Developer Portal.

**`insufficient_scope` on userinfo.** OIDC resource calls require the `openid` scope in the
token. The SDK and button add it automatically; raw integrations must include it in `scope`.

**Wrong environment host.** Each environment has its own IdP host (this documentation's is
`idp.valyd.work`). A token from one environment never works on another — and the Sign-in button
targets whichever host served its script.

**Refresh suddenly failing.** Refresh tokens rotate on every use. If you replay an old one, every
refresh token for that user+client is revoked (theft protection) — persist the newest token
atomically, then re-login once.
