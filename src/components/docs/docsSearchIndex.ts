// Search index for the docs command palette.
// Each entry has a full relative `href` and an `icon` emoji shown in the result row.

export interface DocsSearchEntry {
  title: string;
  /** CommandGroup heading */
  group: string;
  /** Full relative URL, e.g. "/docs/quick-start#quick-install" or "/verify?mode=hosted#hosted" */
  href: string;
  /** Emoji shown before the title in the search result row */
  icon: string;
  keywords?: string[];
}

export const DOCS_SEARCH_INDEX: DocsSearchEntry[] = [
  // ── Valyd ID ─────────────────────────────────────────────────────────────

  { title: "For AI agents",            icon: "🤖", group: "AI agents",          href: "/agents",                                    keywords: ["llms.txt", "llms-full.txt", "openapi", "mcp", "copilot", "agent", "context", "codegen", "postman"] },

  { title: "Introduction",            icon: "📖", group: "Getting started",    href: "/docs/overview",                             keywords: ["overview", "intro", "valyd api", "identity", "getting started", "oauth", "access_token", "client_id"] },

  { title: "Quick start",             icon: "⚡", group: "Quick start",        href: "/docs/quick-start",                          keywords: ["sdk", "begin", "setup"] },
  { title: "Installation",            icon: "⚡", group: "Quick start",        href: "/docs/quick-start#quick-install",             keywords: ["npm", "install", "@valyd/sdk", "package"] },
  { title: "Login with Valyd",        icon: "⚡", group: "Quick start",        href: "/docs/quick-start#quick-start",               keywords: ["sign in", "login button", "authorize"] },
  { title: "Flow at a glance",        icon: "⚡", group: "Quick start",        href: "/docs/quick-start#quick-flow",                keywords: ["overview", "diagram", "steps"] },
  { title: "Environment setup",       icon: "⚡", group: "Quick start",        href: "/docs/quick-start#quick-env",                 keywords: ["env", "variables", ".env", "config"] },

  { title: "Login sessions (CSRF)",   icon: "🔒", group: "Login sessions",     href: "/docs/login-sessions",                       keywords: ["csrf", "createLoginSession", "verifyLoginSession", "marker", "state", "valyd_login", "cookie", "samesite"] },

  { title: "OAuth / TPSSO flow",      icon: "🔑", group: "OAuth / TPSSO",      href: "/docs/authentication",                       keywords: ["oauth2", "tpsso", "authorization code", "sso"] },
  { title: "Authorization URL",       icon: "🔑", group: "OAuth / TPSSO",      href: "/docs/authentication#auth-url",               keywords: ["authorize", "redirect_url", "client_id", "scope param"] },
  { title: "Flow steps",              icon: "🔑", group: "OAuth / TPSSO",      href: "/docs/authentication#oauth-flow",             keywords: ["authorization_code", "exchange", "steps", "grant_type", "code"] },
  { title: "Callback handling",       icon: "🔑", group: "OAuth / TPSSO",      href: "/docs/authentication#callback-handling",      keywords: ["callback", "redirect", "code", "token exchange", "exchangeCode", "access_token"] },

  { title: "Scopes",                  icon: "🏷️", group: "Scopes",             href: "/docs/scopes",                               keywords: ["permissions", "consent", "oauth scopes"] },
  { title: "profile",                 icon: "🏷️", group: "Scopes",             href: "/docs/scopes#scope-profile",                  keywords: ["userinfo", "name", "email", "id_verified", "sub", "valyd_id"] },
  { title: "verifications",           icon: "🏷️", group: "Scopes",             href: "/docs/scopes#scope-verifications",            keywords: ["id_verified", "face_match", "verification", "last_checked"] },
  { title: "zkp",                     icon: "🏷️", group: "Scopes",             href: "/docs/scopes#scope-zkp",                      keywords: ["zero knowledge proof", "age verification", "is_18", "is_21"] },
  { title: "mcp",                     icon: "🏷️", group: "Scopes",             href: "/docs/scopes#scope-mcp",                      keywords: ["model context protocol", "ai agent", "tools"] },

  { title: "API reference",           icon: "🔌", group: "Valyd ID — API",     href: "/docs/endpoints",                            keywords: ["endpoints", "api", "rest"] },
  { title: "POST /token",             icon: "🔌", group: "Valyd ID — API",     href: "/docs/endpoints#endpoint-token",              keywords: ["access_token", "exchange code", "grant_type", "authorization_code", "refresh_token"] },
  { title: "GET /userinfo",           icon: "🔌", group: "Valyd ID — API",     href: "/docs/endpoints#endpoint-userinfo",           keywords: ["profile", "claims", "bearer", "sub", "email", "id_verified"] },
  { title: "GET /licenses",           icon: "🔌", group: "Valyd ID — API",     href: "/docs/endpoints#endpoint-licenses",           keywords: ["doctor license", "nurse", "practitioner", "cpr_certification"] },
  { title: "GET /verifications",      icon: "🔌", group: "Valyd ID — API",     href: "/docs/endpoints#endpoint-verifications",      keywords: ["face_match", "id_verified", "verification status", "last_checked"] },
  { title: "POST /refresh",           icon: "🔌", group: "Valyd ID — API",     href: "/docs/endpoints#endpoint-refresh",            keywords: ["refresh_token", "renew", "access_token", "expires_in"] },

  { title: "Errors & troubleshooting", icon: "⚠️", group: "Errors",            href: "/docs/errors",                               keywords: ["error codes", "400", "401 unauthorized", "403 forbidden", "insufficient_scope", "invalid_grant", "troubleshooting"] },
  { title: "Changelog",               icon: "📝", group: "Changelog",          href: "/docs/changelog",                            keywords: ["releases", "versions", "updates", "sdk v0.2"] },

  { title: "Dev portal setup",        icon: "🖥️", group: "Dev portal setup",   href: "/docs/create-project",                       keywords: ["developer portal", "project", "console"] },
  { title: "Create a project",        icon: "🖥️", group: "Dev portal setup",   href: "/docs/create-project#create-project",         keywords: ["new project", "portal"] },
  { title: "Get credentials",         icon: "🖥️", group: "Dev portal setup",   href: "/docs/create-project#get-credentials",        keywords: ["client_id", "client_secret", "api keys", "credentials", "sk_live", "secret"] },

  { title: "OIDC Integration",        icon: "🔗", group: "OIDC Integration",   href: "/docs/oidc",                                 keywords: ["openid connect", "oidc", "identity provider"] },
  { title: "Introduction",            icon: "🔗", group: "OIDC Integration",   href: "/docs/oidc#oidc-intro",                       keywords: ["openid connect", "overview"] },
  { title: "Prerequisites",           icon: "🔗", group: "OIDC Integration",   href: "/docs/oidc#oidc-prerequisites",               keywords: ["requirements", "before you start"] },
  { title: "Client Registration",     icon: "🔗", group: "OIDC Integration",   href: "/docs/oidc#oidc-registration",                keywords: ["register client", "client_id", "redirect uri"] },
  { title: "Discovery Endpoint",      icon: "🔗", group: "OIDC Integration",   href: "/docs/oidc#oidc-discovery",                   keywords: [".well-known", "openid-configuration", "discovery"] },
  { title: "Manual Configuration",    icon: "🔗", group: "OIDC Integration",   href: "/docs/oidc#oidc-manual-config",               keywords: ["manual setup", "endpoints", "config"] },
  { title: "Mendix Integration",      icon: "🔗", group: "OIDC Integration",   href: "/docs/oidc#oidc-mendix",                      keywords: ["mendix", "low code"] },
  { title: "User Mapping",            icon: "🔗", group: "OIDC Integration",   href: "/docs/oidc#oidc-user-mapping",                keywords: ["claims", "attribute mapping", "user attributes"] },
  { title: "Testing Flow",            icon: "🔗", group: "OIDC Integration",   href: "/docs/oidc#oidc-testing",                     keywords: ["test", "verify", "debug"] },
  { title: "Troubleshooting",         icon: "🔗", group: "OIDC Integration",   href: "/docs/oidc#oidc-troubleshooting",             keywords: ["errors", "issues", "fixes"] },
  { title: "Security Best Practices", icon: "🔗", group: "OIDC Integration",   href: "/docs/oidc#oidc-security",                    keywords: ["security", "pkce", "best practices"] },
  { title: "Example Config",          icon: "🔗", group: "OIDC Integration",   href: "/docs/oidc#oidc-example-config",              keywords: ["sample", "example", "configuration"] },

  // ── Verification APIs ─────────────────────────────────────────────────────────

  { title: "Introduction",            icon: "🛡️", group: "Verification APIs",        href: "/verify#intro",                              keywords: ["kyc", "verify", "overview", "identity verification"] },
  { title: "Quickstart",              icon: "⚡", group: "Verification APIs",        href: "/verify#quickstart",                         keywords: ["get started", "setup", "verify sdk"] },
  { title: "Developer Portal",        icon: "🖥️", group: "Verification APIs",        href: "/verify#console",                            keywords: ["portal", "dashboard", "console", "api key", "workflow"] },
  { title: "Choose your integration", icon: "🛡️", group: "Verification APIs",        href: "/verify#modes",                              keywords: ["hosted", "standalone", "mode", "integration type"] },

  { title: "Hosted Verification",     icon: "🌐", group: "Verification APIs — Hosted", href: "/verify?mode=hosted#hosted",               keywords: ["hosted kyc", "hosted flow", "redirect"] },
  { title: "Overview",                icon: "🌐", group: "Verification APIs — Hosted", href: "/verify?mode=hosted#hosted-overview",      keywords: ["hosted overview"] },
  { title: "The two products",        icon: "🌐", group: "Verification APIs — Hosted", href: "/verify?mode=hosted#hosted-products",      keywords: ["id check", "liveness", "products"] },
  { title: "Integration steps",       icon: "🌐", group: "Verification APIs — Hosted", href: "/verify?mode=hosted#hosted-steps",         keywords: ["step by step", "session", "redirect", "webhook"] },
  { title: "Webhooks",                icon: "🔗", group: "Verification APIs — Hosted", href: "/verify?mode=hosted#hosted-webhooks",      keywords: ["webhook", "event", "X-Valyd-Signature", "hmac"] },
  { title: "Reading the decision",    icon: "✅", group: "Verification APIs — Hosted", href: "/verify?mode=hosted#hosted-decision",      keywords: ["approved", "rejected", "decision", "result"] },
  { title: "Statuses",                icon: "✅", group: "Verification APIs — Hosted", href: "/verify?mode=hosted#hosted-statuses",      keywords: ["pending", "expired", "status"] },

  { title: "Core APIs",         icon: "🔧", group: "Verification APIs — Core APIs", href: "/verify?mode=standalone#standalone",  keywords: ["standalone", "custom ui", "manual"] },

  { title: "Node SDK",                icon: "📦", group: "Verification APIs — SDK",  href: "/verify#sdk",                               keywords: ["node sdk", "npm", "@valyd/sdk"] },
  { title: "Install & init",          icon: "📦", group: "Verification APIs — SDK",  href: "/verify#sdk-install",                       keywords: ["npm install", "initialize", "new VerifyClient"] },
  { title: "Constructor options",     icon: "📦", group: "Verification APIs — SDK",  href: "/verify#sdk-config",                        keywords: ["api key", "config", "options"] },
  { title: "Resources",               icon: "📦", group: "Verification APIs — SDK",  href: "/verify#sdk-resources",                     keywords: ["sessions", "checks", "resource"] },
  { title: "Helpers & types",         icon: "📦", group: "Verification APIs — SDK",  href: "/verify#sdk-types",                         keywords: ["typescript", "types", "helpers"] },
  { title: "Error handling",          icon: "📦", group: "Verification APIs — SDK",  href: "/verify#sdk-errors",                        keywords: ["errors", "try catch", "VerifyError"] },
  { title: "Quickstarts",             icon: "📦", group: "Verification APIs — SDK",  href: "/verify#sdk-quickstarts",                   keywords: ["examples", "code samples"] },
  { title: "Express webhook",         icon: "🔗", group: "Verification APIs — SDK",  href: "/verify#sdk-webhook",                       keywords: ["express", "webhook middleware", "signature"] },

  { title: "Full OpenAPI spec (ID)",   icon: "📄", group: "Valyd ID — API",     href: "/docs/api-reference",                        keywords: ["openapi", "swagger", "full spec", "id api", "tpsso", "oidc", "all endpoints"] },
  { title: "TPSSO — Token exchange",  icon: "🔌", group: "Valyd ID — API",     href: "/docs/api-reference#tpssoToken",              keywords: ["POST /token", "authorization_code", "exchange code", "tpsso token"] },
  { title: "TPSSO — Refresh",         icon: "🔌", group: "Valyd ID — API",     href: "/docs/api-reference#tpssoRefresh",            keywords: ["POST /refresh", "rotate_refresh", "refresh_token", "rotation", "reuse detection", "client_secret"] },
  { title: "TPSSO — UserInfo",        icon: "🔌", group: "Valyd ID — API",     href: "/docs/api-reference#tpssoUserInfo",           keywords: ["GET /userinfo", "profile", "sub", "email"] },
  { title: "TPSSO — Licenses",        icon: "🔌", group: "Valyd ID — API",     href: "/docs/api-reference#tpssoLicenses",           keywords: ["GET /licenses", "nurse", "cpr", "doctor_license"] },
  { title: "TPSSO — Verifications",   icon: "🔌", group: "Valyd ID — API",     href: "/docs/api-reference#tpssoVerifications",      keywords: ["GET /verifications", "id_verified", "face_match"] },
  { title: "OIDC — Discovery",        icon: "🔗", group: "Valyd ID — API",     href: "/docs/api-reference#oidcDiscovery",           keywords: [".well-known", "openid-configuration", "discovery"] },
  { title: "OIDC — Authorize",        icon: "🔗", group: "Valyd ID — API",     href: "/docs/api-reference#oidcAuthorize",           keywords: ["oidc authorize", "authorization_code", "redirect"] },
  { title: "OIDC — Token",            icon: "🔗", group: "Valyd ID — API",     href: "/docs/api-reference#oidcToken",               keywords: ["oidc token", "id_token", "access_token"] },
  { title: "OIDC — UserInfo",         icon: "🔗", group: "Valyd ID — API",     href: "/docs/api-reference#oidcUserInfo",            keywords: ["oidc userinfo", "claims", "preferred_username"] },
  { title: "OIDC — JWKS",             icon: "🔗", group: "Valyd ID — API",     href: "/docs/api-reference#oidcJwks",                keywords: ["jwks", "public keys", "RS256", "jwt verification"] },

  { title: "Full OpenAPI spec (Verify)", icon: "📄", group: "Verification APIs — API", href: "/verify/api",                              keywords: ["openapi", "swagger", "full spec", "verify api", "all endpoints"] },
  { title: "Create session",           icon: "🔌", group: "Verification APIs — API", href: "/verify/api#createSession",                  keywords: ["POST /session", "workflow_id", "hosted session"] },
  { title: "List sessions",            icon: "🔌", group: "Verification APIs — API", href: "/verify/api#listSessions",                   keywords: ["GET /session", "list", "filter status"] },
  { title: "Get session",              icon: "🔌", group: "Verification APIs — API", href: "/verify/api#getSession",                     keywords: ["GET /session/{id}", "retrieve session"] },
  { title: "Session decision",         icon: "🔌", group: "Verification APIs — API", href: "/verify/api#getSessionDecision",             keywords: ["GET /session/{id}/decision", "APPROVED", "checks"] },
  { title: "Override session status",  icon: "🔌", group: "Verification APIs — API", href: "/verify/api#updateSessionStatus",            keywords: ["PATCH /session/{id}/status", "DECLINED", "manual override"] },
  { title: "ID verification check",    icon: "🔧", group: "Verification APIs — API", href: "/verify/api#idVerification",                 keywords: ["POST /id-verification", "OCR", "document", "front_image"] },
  { title: "Liveness check",           icon: "🔧", group: "Verification APIs — API", href: "/verify/api#liveness",                       keywords: ["POST /liveness", "live_score", "selfie", "passive liveness"] },
  { title: "Face match check",         icon: "🔧", group: "Verification APIs — API", href: "/verify/api#faceMatch",                      keywords: ["POST /face-match", "similarity", "portrait comparison"] },
  { title: "Age verification check",   icon: "🔧", group: "Verification APIs — API", href: "/verify/api#ageVerification",                keywords: ["POST /age-verification", "dob", "is_18_plus", "bands"] },
  { title: "Credential verification",  icon: "🔧", group: "Verification APIs — API", href: "/verify/api#credentialVerification",         keywords: ["POST /credential-verification", "license_type", "license_number"] },
  { title: "KYC + credential check",   icon: "🔧", group: "Verification APIs — API", href: "/verify/api#kycCredential",                  keywords: ["POST /kyc-credential", "combined", "id liveness face license"] },

  { title: "Sessions",                icon: "🔌", group: "Verification APIs — API",  href: "/verify?mode=hosted#api-sessions",          keywords: ["create session", "POST /sessions", "session id"] },
  { title: "Workflows",               icon: "🔌", group: "Verification APIs — API",  href: "/verify?mode=hosted#api-workflows",         keywords: ["workflow", "steps", "kyc workflow"] },
  { title: "Decision",                icon: "🔌", group: "Verification APIs — API",  href: "/verify?mode=hosted#api-decision",          keywords: ["decision endpoint", "approve", "reject"] },
  { title: "Core checks",       icon: "🔌", group: "Verification APIs — API",  href: "/verify?mode=standalone#api-standalone",    keywords: ["id check", "liveness", "face match", "age check", "standalone api"] },
  { title: "Errors & rate limits",    icon: "⚠️", group: "Verification APIs — API",  href: "/verify#api-errors",                        keywords: ["rate limit", "429", "error codes", "verify errors"] },

  // ── Recipes ──────────────────────────────────────────────────────────────
  { title: "Ship Hosted KYC",              icon: "📋", group: "Recipes", href: "/verify/ship-hosted-kyc",          keywords: ["hosted kyc", "kyc flow", "session", "redirect", "webhook", "decision", "APPROVED", "DECLINED", "workflow_id"] },
  { title: "Hosted KYC — Create session",  icon: "📋", group: "Recipes", href: "/verify/ship-hosted-kyc#hk-create",  keywords: ["POST /session", "create session", "vendor_data", "ttl"] },
  { title: "Hosted KYC — Verify webhook",  icon: "📋", group: "Recipes", href: "/verify/ship-hosted-kyc#hk-webhook", keywords: ["webhook signature", "hmac", "express.raw", "constructEvent", "event_id", "dedup"] },
  { title: "Verify a professional license", icon: "📋", group: "Recipes", href: "/verify/verify-license",          keywords: ["license", "credential verification", "medical license", "nursing", "engineer", "attorney", "standalone", "POST /credential-verification"] },
  { title: "License — Discover providers", icon: "📋", group: "Recipes", href: "/verify/verify-license#vl-discover", keywords: ["GET /credential/states", "providers", "license_type", "board"] },
  { title: "License — Submit verification",icon: "📋", group: "Recipes", href: "/verify/verify-license#vl-verify",   keywords: ["POST /credential-verification", "first_name", "last_name", "license_number", "license_state"] },

  // ── Valyd MCP ────────────────────────────────────────────────────────────
  { title: "Valyd MCP — Overview",          icon: "🤖", group: "Valyd MCP", href: "/mcp",                               keywords: ["mcp", "model context protocol", "ai agent", "verification", "web agent", "streamable http", "oauth"] },
  { title: "MCP — Authentication",          icon: "🤖", group: "Valyd MCP", href: "/mcp#mcp-auth",                      keywords: ["oauth 2.1", "pkce", "bearer token", "idp.valyd.work", "rfc 9728", "scope mcp"] },
  { title: "MCP — verification_request",    icon: "🤖", group: "Valyd MCP", href: "/mcp#mcp-verification-request",      keywords: ["verification_request", "human in the loop", "face scan", "approve action", "PENDING"] },
  { title: "MCP — verification_status",     icon: "🤖", group: "Valyd MCP", href: "/mcp#mcp-verification-status",       keywords: ["verification_status", "poll", "APPROVED", "DENIED", "DECLINED", "EXPIRED", "assurance_level"] },
  { title: "MCP — do_task",                 icon: "🤖", group: "Valyd MCP", href: "/mcp#mcp-do-task",                   keywords: ["do_task", "web agent", "browser", "task", "start_url", "user_uuid"] },
  { title: "MCP — Claude Code",             icon: "🤖", group: "Valyd MCP", href: "/mcp#mcp-claude-code",               keywords: ["claude mcp add", ".mcp.json", "claude code integration"] },
  { title: "MCP — Codex",                   icon: "🤖", group: "Valyd MCP", href: "/mcp#mcp-codex",                     keywords: ["codex", "config.toml", "openai codex", "bearer_token_env_var"] },
  { title: "MCP — Cursor / Claude Desktop", icon: "🤖", group: "Valyd MCP", href: "/mcp#mcp-cursor",                    keywords: ["cursor", "claude desktop", "mcp.json", "remote mcp server"] },
  { title: "MCP — LangChain",               icon: "🤖", group: "Valyd MCP", href: "/mcp#mcp-langchain",                 keywords: ["langchain", "langgraph", "MultiServerMCPClient", "streamable_http", "python"] },
  { title: "MCP — OpenAI Agents SDK",       icon: "🤖", group: "Valyd MCP", href: "/mcp#mcp-openai-agents",             keywords: ["openai agents", "MCPServerStreamableHttp", "responses api", "python", "openai sdk"] },
  { title: "MCP — Status reference",        icon: "🤖", group: "Valyd MCP", href: "/mcp#mcp-status",                    keywords: ["PENDING", "APPROVED", "DENIED", "DECLINED", "EXPIRED", "assurance_level"] },
];
