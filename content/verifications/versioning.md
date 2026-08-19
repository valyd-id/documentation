# Versioning & deprecation

## What is NOT a breaking change (may ship any time)

These are **additive** and safe — your integration must tolerate them:

- Adding a new endpoint, a new optional request field, or a new workflow feature/check.
- Adding a new field to a response object (e.g. a new key inside `check.data`).
- Adding a new enum value (a new `check.status`, a new failure `signal`, a new event `type`).
- Making a previously-required field optional.
- Bug fixes and performance changes that don't alter the documented contract.

**Build defensively:** ignore unknown response fields, and don't hard-fail on an unrecognized enum
value — treat unknown verification states as **not approved** until your application explicitly
supports them.

## What IS a breaking change (gets a new version)

- Removing or renaming an endpoint, request field, or response field.
- Changing a field's type or the shape of a response.
- Making an optional request field required, or tightening validation.
- Removing an enum value, or changing the meaning of an existing one.
- Changing authentication or error semantics.

Breaking changes are **never** made to `/api/v2` in place. They ship under a new path version
(`/api/v3`). `v2` continues to work.

## Deprecation policy

When a version (or a specific field/endpoint) is deprecated:

1. It is announced in the [Changelog](/docs/changelog) and marked deprecated in this documentation.
2. It keeps working for a **minimum 6-month** migration window after the announcement.
3. Responses may include a `Deprecation` header pointing at the replacement.

You never have to migrate on our schedule inside a major version — pin to `/api/v2` and you are stable
until we announce `v2`'s deprecation with the window above.

## Recommended practices

- Pin the version in your base URL (`/api/v2`) explicitly; don't rely on an unversioned alias.
- Subscribe to the [Changelog](/docs/changelog) for additive changes and any deprecation notices.
- Handle unknown enum values and extra fields gracefully (see "build defensively" above).
