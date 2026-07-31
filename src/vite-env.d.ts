/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** IdP origin, e.g. https://idp.valyd.work */
  readonly VITE_IDP_BASE_URL?: string;
  /** TPSSO API base; defaults to `${VITE_IDP_BASE_URL}/api/auth/tpsso` */
  readonly VITE_API_BASE_URL?: string;
  /** Developer portal URL, e.g. https://dev.valyd.work */
  readonly VITE_DEV_PORTAL_URL?: string;
  /** This docs site's own origin, e.g. https://docs.valyd.work */
  readonly VITE_DOCS_BASE_URL?: string;
  /** Verification APIs origin, e.g. https://idp.valyd.work (Verify is merged into the IdP) */
  readonly VITE_VERIFY_BASE_URL?: string;
  /** Verify console URL; defaults to `${VITE_VERIFY_BASE_URL}/dashboard` */
  readonly VITE_VERIFY_CONSOLE_URL?: string;
  /** Sandbox IdP origin; defaults to VITE_IDP_BASE_URL */
  readonly VITE_SANDBOX_BASE_URL?: string;
  readonly VITE_SANDBOX_CLIENT_ID?: string;
  readonly VITE_SANDBOX_CLIENT_SECRET?: string;
  readonly VITE_BRAND_NAME?: string;
  /** MCP server origin, e.g. https://mcp.valyd.work */
  readonly VITE_MCP_BASE_URL?: string;
  /** Demos site origin, e.g. https://demos.valyd.work */
  readonly VITE_DEMOS_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
