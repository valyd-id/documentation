# Age check

> 📄 **This page moved.** Age verification is documented in one canonical place:
> **[Age verification](/verifications/standalone/age-verification)**. This stub stays so old links
> keep working.

Running an age check for a signed-in user is a **[Managed by Valyd](/verifications/managed)** check —
you run it on a hosted session with the user's `valyd_access_token`, so the age band (`is_18_plus`,
…) saves to their account as a proof. (Age verification is not a self-serve direct call — the bands
derive from the account's KYC-verified DOB.) See
[Age verification](/verifications/standalone/age-verification).
