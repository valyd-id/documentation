import "dotenv/config";
import type { ValydScope } from "@valyd/sdk";

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(
      `\n[valyd-sdk-starter] Missing env var ${name}. Copy .env.example to .env and fill it in.\n`,
    );
    process.exit(1);
  }
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? 8080),
  isProd: process.env.NODE_ENV === "production",

  valyd: {
    clientId: required("VALYD_CLIENT_ID"),
    clientSecret: required("VALYD_CLIENT_SECRET"),
    redirectUri: required("VALYD_REDIRECT_URI"),
    baseUrl: process.env.VALYD_BASE_URL || "https://idp.valyd.work",
  },

  // Optional: a Verify project's API key + a workflow id. When BOTH are set, the signed-in
  // page shows a "Test verification workflow" button that runs the workflow against the
  // logged-in Valyd account (hosted flow). Copy the API key from a project's Verification
  // tab, and a workflow id from that project's workflows — both in the dev portal.
  verify: {
    apiKey: process.env.VALYD_VERIFY_API_KEY || "",
    workflowId: process.env.VALYD_WORKFLOW_ID || "",
    // Verify is served by the same app as the IdP → default to <IdP>/api/v2.
    baseUrl:
      process.env.VALYD_VERIFY_BASE_URL ||
      `${(process.env.VALYD_BASE_URL || "https://idp.valyd.work").replace(/\/+$/, "")}/api/v2`,
    get enabled(): boolean {
      return Boolean(this.apiKey && this.workflowId);
    },
  },

  // Scopes requested on login. Enable these in the Valyd dev portal first.
  scopes: ["profile", "verifications"] as ValydScope[],

  // OIDC transaction cookie contains only a random lookup id. Server-only, 10-minute TTL.
  loginCookie: {
    name: "valyd_login",
    maxAgeMs: 10 * 60 * 1000,
  },

  // Tiny in-memory app session for the demo. Replace with your real session store.
  appSessionCookie: {
    name: "valyd_app_session",
    maxAgeMs: 60 * 60 * 1000,
  },
};
