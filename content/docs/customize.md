# Customization

What you can shape today — nothing here requires a support ticket.

## The hosted flow is yours to compose

The hosted capture page runs exactly the checks **your workflow** defines. You decide which
steps the user goes through, in what order, and how retries behave — compose a workflow in the
[Developer Portal](https://dev.valyd.work) or [via the API](/verifications/workflows), and the
hosted page auto-adapts its steps to it. License-only, full KYC + license, liveness-gated flows:
same page, your composition.

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

## Coming soon: full hosted-flow branding

Full layout, design, and branding customization of the hosted flow is on the roadmap — the goal
is a capture experience that looks and feels like *your* product end to end:

- **Custom colors, logo, and typography** on the hosted verification pages
- **Your own domain** for the hosted flow
- **Branded emails** sent under your name

We're shaping this with early integrators — if hosted-flow branding matters for your rollout,
tell us what you need: [javi@valyd.id](mailto:javi@valyd.id).
