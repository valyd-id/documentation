import { page, escapeHtml } from "./layout.js";
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
      <p>A one-click starter showing secure Valyd OIDC using <code>@valyd/sdk</code>.</p>
    </div>

    <div class="card center">
      <a class="btn" href="/login">Login with Valyd</a>
      <p class="muted small" style="margin-top:14px">
        Configured scopes: <code>${escapeHtml(config.scopes.join(" "))}</code> &nbsp;·&nbsp;
        Redirect: <code>${escapeHtml(config.valyd.redirectUri)}</code>
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
        <div class="avatar">${escapeHtml(initial)}</div>
        <div>
          <h2>${escapeHtml(name)}</h2>
          ${email ? `<div class="email">${escapeHtml(email)}</div>` : ""}
          <div class="badges">
            ${verified ? `<span class="badge ok">✓ ID verified</span>` : `<span class="badge">Not verified</span>`}
            ${session.verifications ? `<span class="badge">verifications scope</span>` : ""}
          </div>
        </div>
      </div>

      <div class="row">
        <form method="post" action="/logout"><button class="btn secondary" type="submit">Log out</button></form>
        <a class="btn ghost" href="/">Refresh</a>
      </div>

      <details>
        <summary>Show raw <code>/userinfo</code> response</summary>
        <pre class="json"><code>${escapeHtml(JSON.stringify(session.user, null, 2))}</code></pre>
      </details>

      ${
        session.verifications
          ? `<details>
        <summary>Show raw <code>/verifications</code> response</summary>
        <pre class="json"><code>${escapeHtml(JSON.stringify(session.verifications, null, 2))}</code></pre>
      </details>`
          : ""
      }
    </div>

    ${verifyCard(session)}
  `,
  );
}

/**
 * "Test verification workflow" — only shown when VALYD_VERIFY_API_KEY + VALYD_WORKFLOW_ID are set.
 * Runs the workflow against the signed-in Valyd account via the hosted flow, then shows the result.
 */
function verifyCard(session: AppSession): string {
  if (!config.verify.enabled) {
    return `
    <div class="card soon" style="margin-top:20px">
      <h3 style="margin-top:0">Test a verification workflow</h3>
      <p class="muted small" style="margin:0">
        Set <code>VALYD_VERIFY_API_KEY</code> and <code>VALYD_WORKFLOW_ID</code> in <code>.env</code> to run one of
        your Verify workflows against this signed-in account. Both come from your project in the dev portal —
        the API key from its <b>Verification</b> tab, and a workflow id from its workflows.
      </p>
    </div>`;
  }

  const result = session.verifyResult as Record<string, unknown> | undefined;
  const status = result ? String(result.status ?? "unknown") : "";
  const statusClass = /verified|approved|complete/i.test(status) ? "ok" : /declined|failed|expired/i.test(status) ? "err" : "";

  return `
  <div class="card" style="margin-top:20px">
    <h3 style="margin-top:0">Test a verification workflow</h3>
    <p class="muted small">
      Runs workflow <code>${escapeHtml(config.verify.workflowId)}</code> against this Valyd account in a hosted flow —
      the account is bound automatically, so verified name / age / licenses come from it and it's a selfie-only match.
    </p>
    <div class="row" style="margin-top:6px">
      <form method="post" action="/verify/start">
        <button class="btn" type="submit">${result ? "Run again" : "Start verification"}</button>
      </form>
      ${result ? `<span class="badge ${statusClass}">status: ${escapeHtml(status)}</span>` : ""}
    </div>
    ${
      result
        ? `<details open style="margin-top:6px">
      <summary>Show verification result</summary>
      <pre class="json"><code>${escapeHtml(JSON.stringify(result, null, 2))}</code></pre>
    </details>`
        : ""
    }
  </div>`;
}
