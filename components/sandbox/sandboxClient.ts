import {
  SANDBOX_BASE_URL,
  SANDBOX_CLIENT_ID,
  SANDBOX_CLIENT_SECRET,
  SANDBOX_REDIRECT_URI,
  type DemoUser
} from './constants'

/** Loose JSON body — API responses are inspected dynamically. */
export type ApiBody = Record<string, unknown>

export interface ApiResult {
  ok: boolean
  status: number
  body: ApiBody
}

async function parseResponse(res: Response): Promise<ApiResult> {
  const text = await res.text()
  let body: ApiBody
  try {
    body = text ? (JSON.parse(text) as ApiBody) : {}
  } catch {
    body = { raw: text }
  }
  return { ok: res.ok, status: res.status, body }
}

function networkError(e: unknown): ApiResult {
  return { ok: false, status: 0, body: { error: 'Network/CORS error', detail: String(e) } }
}

// PKCE (S256) is required by the IdP for every client. issueCode() generates a verifier and
// sends its challenge; exchangeToken() sends the matching verifier. Kept in memory per code.
const pkceVerifiers = new Map<string, string>()
let lastVerifier: string | null = null

function base64Url(bytes: Uint8Array): string {
  let bin = ''
  bytes.forEach(b => { bin += String.fromCharCode(b) })
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function createPkce(): Promise<{ verifier: string; challenge: string }> {
  const verifier = base64Url(crypto.getRandomValues(new Uint8Array(32)))
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return { verifier, challenge: base64Url(new Uint8Array(digest)) }
}

function issuedCodeOf(body: Record<string, unknown>): string | null {
  const data = body.data as Record<string, unknown> | undefined
  const c = body.code ?? body.authorization_code ?? body.auth_code ?? data?.code
  return typeof c === 'string' ? c : null
}

export async function issueCode(demoUser: DemoUser, scopes: string[]): Promise<ApiResult> {
  try {
    // `openid` is required by the OIDC resource endpoints (userinfo etc.) — always
    // include it, exactly like the SDK's getAuthorizationUrl does automatically.
    const withOpenid = scopes.includes('openid') ? scopes : ['openid', ...scopes]
    const pkce = await createPkce()
    lastVerifier = pkce.verifier
    const res = await fetch(`${SANDBOX_BASE_URL}/api/auth/sandbox/issue-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: SANDBOX_CLIENT_ID,
        client_secret: SANDBOX_CLIENT_SECRET,
        scopes: withOpenid,
        demo_user: demoUser,
        redirect_uri: SANDBOX_REDIRECT_URI,
        code_challenge: pkce.challenge,
        code_challenge_method: 'S256'
      })
    })
    const result = await parseResponse(res)
    const issued = result.ok ? issuedCodeOf(result.body) : null
    if (issued) pkceVerifiers.set(issued, pkce.verifier)
    return result
  } catch (e) {
    return networkError(e)
  }
}

export async function exchangeToken(code: string): Promise<ApiResult> {
  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: SANDBOX_REDIRECT_URI,
      client_id: SANDBOX_CLIENT_ID,
      client_secret: SANDBOX_CLIENT_SECRET,
      code_verifier: pkceVerifiers.get(code) ?? lastVerifier ?? ''
    })
    const res = await fetch(`${SANDBOX_BASE_URL}/api/auth/oidc/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    })
    return parseResponse(res)
  } catch (e) {
    return networkError(e)
  }
}

async function bearerGet(path: string, accessToken: string): Promise<ApiResult> {
  try {
    const res = await fetch(`${SANDBOX_BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    return parseResponse(res)
  } catch (e) {
    return networkError(e)
  }
}

export const getUserinfo = (t: string) => bearerGet('/api/auth/oidc/userinfo', t)
export const getLicenses = (t: string) => bearerGet('/api/auth/oidc/licenses', t)
export const getVerifications = (t: string) => bearerGet('/api/auth/oidc/verifications', t)

export async function refreshAccessToken(refreshToken: string): Promise<ApiResult> {
  try {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: SANDBOX_CLIENT_ID,
      client_secret: SANDBOX_CLIENT_SECRET
    })
    const res = await fetch(`${SANDBOX_BASE_URL}/api/auth/oidc/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    })
    return parseResponse(res)
  } catch (e) {
    return networkError(e)
  }
}
