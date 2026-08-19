import { page } from "./layout.js";
import { config } from "../config.js";
import type { AppSession } from "../sessions.js";

export function homePage(session: AppSession | undefined): string {
  if (session) return loggedIn(session);
  return loggedOut();
}

function loggedOut(): string {
  return page(
    "Login with Valyd",
    `
    <div class="hero">
      <h1>Login with Valyd</h1>
      <p>A one-click starter showing secure Valyd OIDC using <code>@valyd/sdk@^1.10.1</code>.</p>
    </div>

    <div class="card center">
      <a class="btn" href="/login">→ Login with Valyd</a>
      <p class="muted small" style="margin-top:14px">
        Configured scopes: <code>${config.scopes.join(" ")}</code> &nbsp;·&nbsp;
        Redirect: <code>${config.valyd.redirectUri}</code>
      </p>
    </div>

    <div class="card" style="margin-top: 20px">
      <h3 style="margin-top:0">What this starter demonstrates</h3>
      <ol class="muted" style="line-height:1.9">
        <li><code>createAuthorizationRequest()</code> generates state, nonce, and S256 PKCE</li>
        <li>The complete transaction stays in the server-side session</li>
        <li>Only an opaque, httpOnly lookup cookie reaches the browser</li>
        <li><code>handleCallback()</code> validates state, PKCE, RS256/JWKS, and nonce</li>
        <li>UserInfo and verification resources use the canonical OIDC namespace</li>
      </ol>
    </div>
  `,
  );
}

function loggedIn(session: AppSession): string {
  const user = (session.user ?? {}) as Record<string, unknown>;
  const name =
    (user.name as string) ||
    (user.full_name as string) ||
    (user.first_name as string) ||
    (user.email as string) ||
    "User";
  const initial = (name[0] || "U").toUpperCase();
  const email = (user.email as string) || "";
  const verified = (user.id_verified as boolean) === true;

  return page(
    "Signed in",
    `
    <div class="card">
      <div class="profile">
        <div class="avatar">${escape(initial)}</div>
        <div>
          <h2>${escape(name)}</h2>
          ${email ? `<div class="email">${escape(email)}</div>` : ""}
          <div class="badges">
            ${verified ? `<span class="badge ok">✓ ID verified</span>` : `<span class="badge">Not verified</span>`}
            ${session.verifications ? `<span class="badge">verifications scope</span>` : ""}
          </div>
        </div>
      </div>

      <div class="row">
        <form method="post" action="/logout"><button class="btn secondary" type="submit">Log out</button></form>
        <a class="btn" href="/">Refresh</a>
      </div>

      <details>
        <summary>Show raw <code>/userinfo</code> response</summary>
        <pre class="json"><code>${escape(JSON.stringify(session.user, null, 2))}</code></pre>
      </details>

      ${
        session.verifications
          ? `<details>
        <summary>Show raw <code>/verifications</code> response</summary>
        <pre class="json"><code>${escape(JSON.stringify(session.verifications, null, 2))}</code></pre>
      </details>`
          : ""
      }
    </div>
  `,
  );
}

function escape(s: unknown): string {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
