# Versioning & deprecation

Verification is consumed through the `@valyd/sdk` package — you pin the **SDK version**, and the
SDK tracks the current verification contract for you.

## What is NOT a breaking change (may ship any time)

These are **additive** and safe — your integration must tolerate them:

- Adding a new SDK method, a new optional parameter, or a new workflow feature/check.
- Adding a new field to a response object (e.g. a new key inside `check.data`).
- Adding a new enum value (a new `check.status`, a new failure `signal`, a new event `type`).
- Making a previously-required field optional.
- Bug fixes and performance changes that don't alter the documented contract.

**Build defensively:** ignore unknown response fields, and don't hard-fail on an unrecognized enum
value — treat unknown verification states as **not approved** until your application explicitly
supports them.

## What IS a breaking change (gets a new major SDK version)

- Removing or renaming an SDK method, parameter, or response field.
- Changing a field's type or the shape of a response.
- Making an optional parameter required, or tightening validation.
- Removing an enum value, or changing the meaning of an existing one.
- Changing authentication or error semantics.

Breaking changes are **never** made to a released SDK major in place. They ship under a new major
version; the pin you already have keeps working.

## Deprecation policy

When a method or field is deprecated:

1. It is announced in the [Changelog](/docs/changelog) and marked deprecated in this documentation.
2. It keeps working for a **minimum 6-month** migration window after the announcement.
3. The SDK surfaces a deprecation notice pointing at the replacement.

You never have to migrate on our schedule inside a major version — pin the SDK (see below) and you
are stable until we announce that major's deprecation with the window above.

## Recommended practices

- Pin the SDK with a caret range — `npm i @valyd/sdk@^1.10.4` — so you get compatible patch and
  minor updates without an unexpected major bump.
- Subscribe to the [Changelog](/docs/changelog) for additive changes and any deprecation notices.
- Handle unknown enum values and extra fields gracefully (see "build defensively" above).
