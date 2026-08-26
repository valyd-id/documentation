# Age check

> 📄 **This page moved.** Age verification is documented in the
> **[Checks reference](/verifications/types)**. This stub stays so old links keep working.

Age is a **workflow check**, not a direct public API: run a configured
[workflow](/verifications/workflows) on a [Reusable Verification](/verifications) session with
the user's `valyd_access_token`, and the age band (`is_18_plus`, …) saves to their account as a
proof. The bands derive from the account's KYC-verified DOB. See the
[Checks reference](/verifications/types).
