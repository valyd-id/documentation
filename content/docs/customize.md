# Customization

What you can brand today — nothing here requires a support ticket.

## Your name on the consent screen

Pass `product_name` on the authorize URL (the button's `data-product-name`, the SDK's
`productName` option, or the raw query param) and the consent screen shows **your** product's
name and initial:

![The consent screen showing the requesting app's name](/images/screenshots/idp-consent-screen.png)

## The Sign-in button

The drop-in button accepts:

| Attribute | Values | Default |
| --- | --- | --- |
| `data-theme` | `dark` · `light` | `dark` |
| `data-text` | any label | `Sign in with Valyd` |
| `data-mode` | `redirect` · `popup` | `redirect` |

Or skip it entirely and render your own button — it only needs to link to the
[authorize URL](/docs/flows/authorization-code).

## Hosted verification

The hosted capture page runs the checks **your workflow** defines — you control which steps the
user goes through, retries and ordering included. See [Workflows](/verifications/workflows).

## Not available yet

Custom domains for the login/consent pages and branded emails are not offered today — if these
matter for your rollout, tell us: [javi@valyd.id](mailto:javi@valyd.id).
