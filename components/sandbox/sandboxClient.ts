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

export async function issueCode(demoUser: DemoUser, scopes: string[]): Promise<ApiResult> {
  try {
    // `openid` is required by the OIDC resource endpoints (userinfo etc.) — always
    // include it, exactly like the SDK's getAuthorizationUrl does automatically.
    const withOpenid = scopes.includes('openid') ? scopes : ['openid', ...scopes]
    const res = await fetch(`${SANDBOX_BASE_URL}/api/auth/sandbox/issue-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: SANDBOX_CLIENT_ID,
        client_secret: SANDBOX_CLIENT_SECRET,
        scopes: withOpenid,
        demo_user: demoUser,
        redirect_uri: SANDBOX_REDIRECT_URI
      })
    })
    return parseResponse(res)
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
