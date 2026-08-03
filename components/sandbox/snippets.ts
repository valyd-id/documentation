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

export function step1Snippet(demoUser: DemoUser, scopes: string[]): Snippet {
  const payload = {
    client_id: SANDBOX_CLIENT_ID,
    client_secret: SANDBOX_CLIENT_SECRET,
    scopes,
    demo_user: demoUser,
    redirect_uri: SANDBOX_REDIRECT_URI
  }
  const json = JSON.stringify(payload, null, 2)
  const url = `${SANDBOX_BASE_URL}/api/auth/sandbox/issue-code`
  return {
    curl: `curl -X POST ${url} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload)}'`,
    js: `const res = await fetch("${url}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(${json})
});
const data = await res.json();
console.log(data);`,
    python: `import requests

res = requests.post(
    "${url}",
    json=${json}
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
  -d "client_secret=${SANDBOX_CLIENT_SECRET}"`,
    js: `const body = new URLSearchParams({
  grant_type: "authorization_code",
  code: "${c}",
  redirect_uri: "${SANDBOX_REDIRECT_URI}",
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
        "grant_type": "authorization_code",
        "code": "${c}",
        "redirect_uri": "${SANDBOX_REDIRECT_URI}",
        "client_id": "${SANDBOX_CLIENT_ID}",
        "client_secret": "${SANDBOX_CLIENT_SECRET}",
    },
)
print(res.json())`
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
