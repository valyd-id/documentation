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
