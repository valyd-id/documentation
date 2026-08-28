import express from "express";
import cookieParser from "cookie-parser";
import { ValydClient } from "@valyd/sdk";

import { config } from "./config.js";
import { sessions } from "./sessions.js";
import { homePage } from "./views/home.js";
import { errorPage } from "./views/error.js";

const valyd = new ValydClient({
  clientId: config.valyd.clientId,
  clientSecret: config.valyd.clientSecret,
  redirectUri: config.valyd.redirectUri,
  baseUrl: config.valyd.baseUrl,
});

const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

/* -------------------------- Home -------------------------- */
app.get("/", (req, res) => {
  const session = sessions.get(req.cookies[config.appSessionCookie.name]);
  res.type("html").send(homePage(session));
});

/* ----------------------- Login start ---------------------- */
// Generate state + nonce + S256 PKCE together, then store the transaction server-side.
app.get("/login", async (_req, res, next) => {
  try {
    const transaction = valyd.createAuthorizationRequest({ scope: config.scopes });
    const loginId = sessions.createLogin(transaction);

    res.cookie(config.loginCookie.name, loginId, {
      httpOnly: true,
      sameSite: "lax",
      secure: config.isProd,
      maxAge: config.loginCookie.maxAgeMs,
      path: "/",
    });

    res.redirect(transaction.url);
  } catch (err) {
    next(err);
  }
});

/* -------------------------- Callback ---------------------- */
// Consume the stored transaction once, then validate the complete callback.
app.get("/callback", async (req, res) => {
  const loginId = req.cookies[config.loginCookie.name];
  const transaction = sessions.consumeLogin(loginId);
  res.clearCookie(config.loginCookie.name, { path: "/" });
  if (!transaction) {
    return res.status(400).type("html").send(
      errorPage(
        "Invalid login session",
        "The OIDC transaction is missing, expired, or already used. Start the login flow again.",
      ),
    );
  }

  try {
    // Strict state comparison, PKCE exchange, RS256/JWKS and nonce validation, then UserInfo.
    const { tokens, user } = await valyd.handleCallback(req.originalUrl, { transaction });
    let verifications: unknown;
    if (config.scopes.includes("verifications")) {
      try {
        verifications = await valyd.getVerifications(tokens.accessToken);
      } catch {
        // Scope might not be enabled for this client. Soft-fail.
        verifications = { note: "verifications scope not enabled or call failed" };
      }
    }

    const appSession = sessions.create({
      user,
      verifications,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    // The browser receives only an opaque app-session id, never tokens or client credentials.
    res.cookie(config.appSessionCookie.name, appSession.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: config.isProd,
      maxAge: config.appSessionCookie.maxAgeMs,
      path: "/",
    });

    res.redirect("/");
  } catch {
    res.status(400).type("html").send(errorPage("Secure login failed", "Please start the login flow again."));
  }
});

/* ------------------- Verify: start a workflow ------------- */
// Create a HOSTED verification session bound to the logged-in Valyd account, then send the
// browser to the hosted page. Needs VALYD_VERIFY_API_KEY + VALYD_WORKFLOW_ID in .env.
app.post("/verify/start", async (req, res) => {
  const session = sessions.get(req.cookies[config.appSessionCookie.name]);
  if (!session) return res.redirect("/");
  if (!config.verify.enabled) {
    return res.status(400).type("html").send(
      errorPage("Verification not configured", "Set VALYD_VERIFY_API_KEY and VALYD_WORKFLOW_ID in .env to test a workflow."),
    );
  }

  try {
    const origin = `${req.protocol}://${req.get("host")}`;
    const r = await fetch(`${config.verify.baseUrl}/session`, {
      method: "POST",
      headers: { Authorization: `Bearer ${config.verify.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        workflow_id: config.verify.workflowId,
        redirect_url: `${origin}/verify/return`,
        // Binds the hosted flow to THIS logged-in Valyd user (selfie-only match, no re-KYC,
        // and verified name/age/licenses come from their account). Never reaches the browser.
        valyd_access_token: session.accessToken,
      }),
    });
    const body = (await r.json()) as { success?: boolean; data?: any; error?: any };
    if (!r.ok || !body?.data?.url) {
      const msg = body?.error?.message || `Verify API returned ${r.status}`;
      return res.status(400).type("html").send(errorPage("Couldn't start verification", msg, body));
    }
    // Remember the session id so /verify/return can fetch the outcome.
    session.verifySessionId = body.data.session_id;
    res.redirect(body.data.url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).type("html").send(errorPage("Couldn't start verification", msg));
  }
});

/* ------------------- Verify: return + result -------------- */
// The hosted page sends the user back here. Fetch the session's current state and show it.
app.get("/verify/return", async (req, res) => {
  const session = sessions.get(req.cookies[config.appSessionCookie.name]);
  if (!session || !session.verifySessionId) return res.redirect("/");

  try {
    const r = await fetch(`${config.verify.baseUrl}/session/${encodeURIComponent(session.verifySessionId)}`, {
      headers: { Authorization: `Bearer ${config.verify.apiKey}` },
    });
    const body = (await r.json()) as { data?: unknown };
    session.verifyResult = body?.data ?? body;
  } catch (err) {
    session.verifyResult = { error: err instanceof Error ? err.message : "Could not fetch result" };
  }
  res.redirect("/");
});

/* -------------------------- Logout ------------------------ */
app.post("/logout", (req, res) => {
  sessions.destroy(req.cookies[config.appSessionCookie.name]);
  res.clearCookie(config.appSessionCookie.name, { path: "/" });
  sessions.destroyLogin(req.cookies[config.loginCookie.name]);
  res.clearCookie(config.loginCookie.name, { path: "/" });
  res.redirect("/");
});

/* ----------------------- Error handler -------------------- */
app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  void next;
  console.error(err);
  const message = err instanceof Error ? err.message : "Unknown error";
  res.status(500).type("html").send(errorPage("Server error", message));
});

app.listen(config.port, () => {
  console.log(`\n✓ Valyd SDK starter running\n  → http://localhost:${config.port}\n  Redirect URI: ${config.valyd.redirectUri}\n  IdP:          ${config.valyd.baseUrl}\n`);
});
