import {
  SANDBOX_BASE_URL,
  SANDBOX_CLIENT_ID,
  SANDBOX_CLIENT_SECRET,
  SANDBOX_REDIRECT_URI,
  type DemoUser
} from './constants'

export type Lang = 'curl' | 'js' | 'python'

export interface Snippet {
  curl: string
  js: string
  python: string
}

// PKCE (S256) is required for every client — the displayed snippets generate a verifier,
// send its challenge when the code is issued, and send the verifier at the token exchange.
export function step1Snippet(demoUser: DemoUser, scopes: string[]): Snippet {
  const payload = {
    client_id: SANDBOX_CLIENT_ID,
    client_secret: SANDBOX_CLIENT_SECRET,
    scopes,
    demo_user: demoUser,
    redirect_uri: SANDBOX_REDIRECT_URI
  }
  const pkcePayload = { ...payload, code_challenge: 'CODE_CHALLENGE', code_challenge_method: 'S256' }
  const json = JSON.stringify(pkcePayload, null, 2).replace('"CODE_CHALLENGE"', 'codeChallenge')
  const pyJson = JSON.stringify(pkcePayload, null, 4).replace('"CODE_CHALLENGE"', 'code_challenge')
  const url = `${SANDBOX_BASE_URL}/api/auth/sandbox/issue-code`
  return {
    curl: `# PKCE: keep CODE_VERIFIER for the token exchange (step 2)
CODE_VERIFIER=$(openssl rand -base64 48 | tr '+/' '-_' | tr -d '=\\n')
CODE_CHALLENGE=$(printf '%s' "$CODE_VERIFIER" | openssl dgst -sha256 -binary | openssl base64 -A | tr '+/' '-_' | tr -d '=')

curl -X POST ${url} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(pkcePayload).replace('CODE_CHALLENGE', "'\"$CODE_CHALLENGE\"'")}'`,
    js: `// PKCE: keep codeVerifier for the token exchange (step 2)
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)))
  .replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/, "");
const codeVerifier = b64url(crypto.getRandomValues(new Uint8Array(32)));
const codeChallenge = b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier)));

const res = await fetch("${url}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(${json})
});
const data = await res.json();
console.log(data);`,
    python: `import base64, hashlib, secrets
import requests

# PKCE: keep code_verifier for the token exchange (step 2)
code_verifier = secrets.token_urlsafe(48)
code_challenge = base64.urlsafe_b64encode(
    hashlib.sha256(code_verifier.encode()).digest()
).rstrip(b"=").decode()

res = requests.post(
    "${url}",
    json=${pyJson}
)
print(res.json())`
  }
}

const EXAMPLE_CODE = 'valyd_sbx_code_aD8xQ2k7Lm9PqRsT1uVwXyZ'
const EXAMPLE_ACCESS_TOKEN =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vX251cnNlIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSB2ZXJpZmljYXRpb25zIiwiaWF0IjoxNzMwMDAwMDAwLCJleHAiOjE3MzAwMDM2MDB9.sandbox_signature_example'
const EXAMPLE_REFRESH_TOKEN = 'valyd_sbx_rt_M3nFgH7kP2qRsT9vWxYzAb'

export function step2Snippet(code: string | null): Snippet {
  const c = code || EXAMPLE_CODE
  const url = `${SANDBOX_BASE_URL}/api/auth/oidc/token`
  return {
    curl: `curl -X POST ${url} \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=authorization_code" \\
  -d "code=${c}" \\
  -d "redirect_uri=${SANDBOX_REDIRECT_URI}" \\
  -d "client_id=${SANDBOX_CLIENT_ID}" \\
  -d "client_secret=${SANDBOX_CLIENT_SECRET}" \\
  -d "code_verifier=$CODE_VERIFIER"
# Errors are RFC 6749 JSON: {"error":"invalid_grant","error_description":"..."}`,
    js: `const body = new URLSearchParams({
  grant_type: "authorization_code",
  code: "${c}",
  redirect_uri: "${SANDBOX_REDIRECT_URI}",
  client_id: "${SANDBOX_CLIENT_ID}",
  client_secret: "${SANDBOX_CLIENT_SECRET}",
  code_verifier: codeVerifier // from step 1 (PKCE)
});
const res = await fetch("${url}", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body
});
const tokens = await res.json();
if (!res.ok) throw new Error(\`\${tokens.error}: \${tokens.error_description}\`); // RFC 6749 §5.2
console.log(tokens);`,
    python: `import requests

res = requests.post(
    "${url}",
    data={
        "grant_type": "authorization_code",
        "code": "${c}",
        "redirect_uri": "${SANDBOX_REDIRECT_URI}",
        "client_id": "${SANDBOX_CLIENT_ID}",
        "client_secret": "${SANDBOX_CLIENT_SECRET}",
        "code_verifier": code_verifier,  # from step 1 (PKCE)
    },
)
tokens = res.json()
if not res.ok:  # RFC 6749 §5.2: {"error": "...", "error_description": "..."}
    raise RuntimeError(f"{tokens['error']}: {tokens.get('error_description')}")
print(tokens)`
  }
}

export function bearerSnippet(path: string, accessToken: string | null): Snippet {
  const t = accessToken || EXAMPLE_ACCESS_TOKEN
  const url = `${SANDBOX_BASE_URL}${path}`
  return {
    curl: `curl ${url} \\
  -H "Authorization: Bearer ${t}"`,
    js: `const res = await fetch("${url}", {
  headers: { Authorization: "Bearer ${t}" }
});
console.log(await res.json());`,
    python: `import requests

res = requests.get(
    "${url}",
    headers={"Authorization": "Bearer ${t}"},
)
print(res.json())`
  }
}

export function refreshSnippet(refreshToken: string | null): Snippet {
  const t = refreshToken || EXAMPLE_REFRESH_TOKEN
  const url = `${SANDBOX_BASE_URL}/api/auth/oidc/token`
  return {
    curl: `curl -X POST ${url} \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=refresh_token" \\
  -d "refresh_token=${t}" \\
  -d "client_id=${SANDBOX_CLIENT_ID}" \\
  -d "client_secret=${SANDBOX_CLIENT_SECRET}"`,
    js: `const body = new URLSearchParams({
  grant_type: "refresh_token",
  refresh_token: "${t}",
  client_id: "${SANDBOX_CLIENT_ID}",
  client_secret: "${SANDBOX_CLIENT_SECRET}"
});
const res = await fetch("${url}", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body
});
console.log(await res.json());`,
    python: `import requests

res = requests.post(
    "${url}",
    data={
        "grant_type": "refresh_token",
        "refresh_token": "${t}",
        "client_id": "${SANDBOX_CLIENT_ID}",
        "client_secret": "${SANDBOX_CLIENT_SECRET}",
    },
)
print(res.json())`
  }
}
