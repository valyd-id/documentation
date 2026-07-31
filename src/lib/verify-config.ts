// Verification API config (environment-driven; see api-config.ts + .env.example)
const env = import.meta.env;

// Verify is served BY the IdP (/api/v2, /api/hosted). The old verify.* host is retired.
const VERIFY_BASE_URL = env.VITE_VERIFY_BASE_URL ?? "https://idp.valyd.id";
const DEV_PORTAL_URL = env.VITE_DEV_PORTAL_URL ?? "https://dev.valyd.id";

export const VERIFY_CONFIG = {
  API_BASE_URL: VERIFY_BASE_URL,
  // CONSOLE UNIFICATION: the dev portal IS the console. One sign-in issues the OAuth
  // client_id/client_secret AND the Verify API key AND the workflows. There is no separate
  // Verify dashboard any more — VITE_VERIFY_CONSOLE_URL now points at the dev portal.
  CONSOLE_URL: env.VITE_VERIFY_CONSOLE_URL ?? DEV_PORTAL_URL,
  DEV_PORTAL_URL,
  BRAND_NAME: "Verification APIs",
} as const;

/** The console host without a scheme — e.g. "dev.valyd.work". */
export const CONSOLE_HOST = VERIFY_CONFIG.CONSOLE_URL.replace(/^https?:\/\//, "").replace(/\/+$/, "");
