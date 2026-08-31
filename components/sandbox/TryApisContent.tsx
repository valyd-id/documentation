'use client'

import { VerifyPlayground } from './VerifyPlayground'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Fingerprint,
  KeyRound,
  Loader2,
  Play,
  Shield,
  Sparkles,
  Terminal
} from 'lucide-react'
import { cn } from './cn'
import { Button, ButtonLink } from '../ui/button'
import { Alert } from '../ui/alert'
import { TooltipProvider } from '../ui/tooltip'
import { CredentialsBlock } from './CredentialsBlock'
import { DemoUserPicker } from './DemoUserPicker'
import { ScopePicker } from './ScopePicker'
import { PasteInput } from './PasteInput'
import { JsonPanel } from './JsonPanel'
import { SnippetTabs } from './SnippetTabs'
import { DEFAULT_SCOPES, type DemoUser, DEV_PORTAL_URL } from './constants'
import {
  issueCode,
  exchangeToken,
  getUserinfo,
  getLicenses,
  getVerifications,
  refreshAccessToken,
  type ApiResult
} from './sandboxClient'
import { step1Snippet, step2Snippet, bearerSnippet, refreshSnippet } from './snippets'
import { decodeJwtPayload } from './jwt'

type EndpointKey =
  | 'issue-code'
  | 'exchange-token'
  | 'userinfo'
  | 'licenses'
  | 'verifications'
  | 'refresh'

type Tokens = {
  access_token: string
  id_token?: string
  refresh_token?: string
  expires_in?: number
  scope?: string
}

interface EndpointMeta {
  key: EndpointKey
  method: 'GET' | 'POST'
  label: string
  path: string
  description: string
}

const ENDPOINTS: EndpointMeta[] = [
  {
    key: 'issue-code',
    method: 'POST',
    label: 'Get Authorization Code',
    path: '/api/auth/sandbox/issue-code',
    description:
      'Issues a short-lived OAuth code for the selected demo user. Sandbox-only shortcut that mirrors the real authorize step.'
  },
  {
    key: 'exchange-token',
    method: 'POST',
    label: 'Exchange Code for Token',
    path: '/api/auth/oidc/token',
    description:
      'Exchanges the authorization code from Step 1 for an access_token, id_token and refresh_token.'
  },
  {
    key: 'userinfo',
    method: 'GET',
    label: 'Get User Info',
    path: '/api/auth/oidc/userinfo',
    description:
      "Returns the authenticated user's profile claims. Sends the access_token as `Authorization: Bearer …`."
  },
  {
    key: 'licenses',
    method: 'GET',
    label: 'Get Licenses',
    path: '/api/auth/oidc/licenses',
    description:
      'Returns verified professional licenses (medical / nursing) attached to the user.'
  },
  {
    key: 'verifications',
    method: 'GET',
    label: 'Get Verifications',
    path: '/api/auth/oidc/verifications',
    description: 'Returns verifiable credentials the user has presented to the IDP.'
  },
  {
    key: 'refresh',
    method: 'POST',
    label: 'Refresh Access Token',
    path: '/api/auth/oidc/token',
    description:
      'Uses the refresh_token from Step 2 to mint a fresh access_token via the OIDC token endpoint (grant_type=refresh_token).'
  }
]

const methodColors: Record<'GET' | 'POST', string> = {
  GET: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900',
  POST: 'bg-(--vd-primary-soft) text-(--vd-primary) border-(--vd-primary-border)'
}

/** Safe accessors for the loosely-typed API bodies. */
const asString = (v: unknown): string | null => (typeof v === 'string' && v ? v : null)
const asObject = (v: unknown): Record<string, unknown> | null =>
  v !== null && typeof v === 'object' ? (v as Record<string, unknown>) : null

export const TryApisContent = () => {
  const [lane, setLane] = useState<'login' | 'verify' | null>(null)
  const [active, setActive] = useState<EndpointKey>('issue-code')

  const [demoUser, setDemoUserState] = useState<DemoUser>('nurse')
  const [scopes, setScopesState] = useState<Set<string>>(new Set(DEFAULT_SCOPES))

  const [codeInput, setCodeInput] = useState('')
  const [accessTokenInput, setAccessTokenInput] = useState('')
  const [refreshTokenInput, setRefreshTokenInput] = useState('')

  const [tokens, setTokens] = useState<Tokens | null>(null)
  const [results, setResults] = useState<Partial<Record<EndpointKey, ApiResult>>>({})
  const [loading, setLoading] = useState<Partial<Record<EndpointKey, boolean>>>({})

  const resetFlow = () => {
    setCodeInput('')
    setAccessTokenInput('')
    setRefreshTokenInput('')
    setTokens(null)
    setResults({})
    setActive('issue-code')
  }

  const setDemoUser = (v: DemoUser) => {
    if (v === demoUser) return
    setDemoUserState(v)
    resetFlow()
  }
  const setScopes = (s: Set<string>) => {
    setScopesState(s)
    resetFlow()
  }

  const scopeList = useMemo(() => Array.from(scopes), [scopes])
  const activeMeta = ENDPOINTS.find(e => e.key === active)!
  const activeIndex = ENDPOINTS.findIndex(e => e.key === active)
  const activeResult = results[active] ?? null

  const setRes = (k: EndpointKey, r: ApiResult) => setResults(prev => ({ ...prev, [k]: r }))
  const setLoad = (k: EndpointKey, v: boolean) => setLoading(prev => ({ ...prev, [k]: v }))

  const run = async () => {
    setLoad(active, true)
    try {
      if (active === 'issue-code') {
        const res = await issueCode(demoUser, scopeList)
        setRes('issue-code', res)
        const issuedCode =
          asString(res.body.code) ??
          asString(res.body.authorization_code) ??
          asString(res.body.auth_code) ??
          asString(asObject(res.body.data)?.code)
        if (res.ok && issuedCode) setCodeInput(issuedCode)
      } else if (active === 'exchange-token') {
        const c = codeInput.trim()
        if (!c) return
        const res = await exchangeToken(c)
        setRes('exchange-token', res)
        const accessToken = asString(res.body.access_token)
        if (res.ok && accessToken) {
          const t: Tokens = {
            access_token: accessToken,
            id_token: asString(res.body.id_token) ?? undefined,
            refresh_token: asString(res.body.refresh_token) ?? undefined
          }
          setTokens(t)
          setAccessTokenInput(t.access_token)
          setRefreshTokenInput(t.refresh_token ?? '')
        }
      } else if (active === 'refresh') {
        const rt = refreshTokenInput.trim()
        if (!rt) return
        const res = await refreshAccessToken(rt)
        setRes('refresh', res)
        const accessToken = asString(res.body.access_token)
        if (res.ok && accessToken) {
          setAccessTokenInput(accessToken)
          const newRefresh = asString(res.body.refresh_token)
          if (newRefresh) setRefreshTokenInput(newRefresh)
        }
      } else {
        const t = accessTokenInput.trim()
        if (!t) return
        const fn =
          active === 'userinfo' ? getUserinfo : active === 'licenses' ? getLicenses : getVerifications
        const res = await fn(t)
        setRes(active, res)
      }
    } finally {
      setLoad(active, false)
    }
  }

  const snippet =
    active === 'issue-code'
      ? step1Snippet(demoUser, scopeList)
      : active === 'exchange-token'
        ? step2Snippet(codeInput || null)
        : active === 'refresh'
          ? refreshSnippet(refreshTokenInput || null)
          : bearerSnippet(activeMeta.path, accessTokenInput || null)

  const runDisabled =
    (active === 'exchange-token' && !codeInput.trim()) ||
    (active === 'refresh' && !refreshTokenInput.trim()) ||
    (['userinfo', 'licenses', 'verifications'].includes(active) && !accessTokenInput.trim())

  const isLoading = !!loading[active]

  const decodedIdToken = useMemo(
    () => (tokens?.id_token ? decodeJwtPayload(tokens.id_token) : null),
    [tokens]
  )

  const completed = (k: EndpointKey) => results[k]?.ok === true

  return (
    <TooltipProvider>
      {/* Hero header — `vd-rise` is the global, reduced-motion-gated entrance animation */}
      <header
        className="vd-rise relative overflow-hidden rounded-2xl border border-(--vd-border) bg-white px-6 py-12 sm:px-10 dark:bg-slate-950"
        style={{ '--i': 0 } as React.CSSProperties}
      >
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-(--vd-border) bg-white/70 px-3 py-1 shadow-sm backdrop-blur dark:bg-slate-950/70">
            <Sparkles className="h-3.5 w-3.5 text-(--vd-primary)" />
            <span className="text-xs font-semibold tracking-wide text-gray-700 dark:text-gray-300">
              Interactive Sandbox
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-gray-100">
            API Playground
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-400">
            Valyd does two things. The <span className="font-semibold text-gray-900 dark:text-gray-100">Unique Human API</span>{' '}
            runs liveness and uniqueness checks from your backend with just an API key —{' '}
            <span className="font-semibold">no user login, nothing saved</span>.{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">Reusable Verification</span>{' '}
            starts with Connect with Valyd (standard OIDC): read the user's verified data, run a
            configured workflow, and passed proofs save to their Valyd ID. Pick what you're
            building for below.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-(--vd-primary) transition-all hover:gap-2.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Read the full documentation
            </Link>
          </div>
        </div>
      </header>

      <div className="mt-8 space-y-6">
        {/* Product picker — the same two products the docs sell: Connect vs API-key checks. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(
            [
              {
                id: 'login' as const,
                label: 'Connect with Valyd',
                tag: 'User connects',
                desc: 'Standard OIDC — the first step of Reusable Verification. The user connects their Valyd ID and you read what their account already holds — profile (legal name), licenses, verification proofs. Try the whole flow live below.',
                icon: Fingerprint
              },
              {
                id: 'verify' as const,
                label: 'Run a verification',
                tag: 'Workflows + API',
                desc: 'Run a configured verification workflow for a connected user (proofs save to their Valyd ID), or call the Unique Human API — liveness and uniqueness with just an App API key.',
                icon: Shield
              }
            ]
          ).map((p, i) => {
            const Icon = p.icon
            const selected = lane === p.id
            return (
              <button
                key={p.id}
                onClick={() => setLane(p.id)}
                className={cn(
                  'vd-rise group relative overflow-hidden rounded-xl border bg-white p-5 text-left transition-all dark:bg-slate-950',
                  selected
                    ? 'border-(--vd-primary) shadow-md ring-2 ring-(--vd-primary-border)'
                    : 'cursor-pointer border-(--vd-border) hover:border-(--vd-primary-border) hover:shadow-sm'
                )}
                style={{ '--i': i + 1 } as React.CSSProperties}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      selected
                        ? 'bg-(--vd-primary) text-white dark:text-slate-900'
                        : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-300'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {selected ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-(--vd-primary-soft) px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-(--vd-primary)">
                      <Check className="h-3 w-3" /> Selected
                    </span>
                  ) : (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
                      {p.tag}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-gray-100">
                  {p.label}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {p.desc}
                </p>
              </button>
            )
          })}
        </div>

        {/* SDK starter repo — Connect with Valyd tooling, so hide it on the API-key side
            where "no OIDC needed" is the whole point. */}
        {lane !== 'verify' && (
        <section
          className="@container vd-rise relative overflow-hidden rounded-2xl border border-(--vd-border) bg-white p-6 sm:p-8 dark:bg-slate-950"
          style={{ '--i': 4 } as React.CSSProperties}
        >
          <div className="grid items-center gap-6 @min-[560px]:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-(--vd-primary-soft) px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-(--vd-primary)">
                <Terminal className="h-3.5 w-3.5" />
                Run locally
              </div>
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">
                Want the real OAuth flow? Clone the SDK starter.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                A minimal Express app wired up with <code className="font-mono">@valyd/sdk</code> —
                standard OIDC with <code className="font-mono">state</code> +{' '}
                <code className="font-mono">nonce</code> CSRF handling. The full
                redirect-and-consent flow on your localhost in three commands.
              </p>
              <pre className="mt-4 overflow-auto rounded-md bg-slate-950 p-3 font-mono text-xs text-slate-100">
                {`git clone https://github.com/valyd-id/valyd-sandbox-starter.git
cd valyd-sandbox-starter
npm install
cp .env.example .env   # fill in client id/secret
npm run dev`}
              </pre>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Then open <code className="font-mono">http://localhost:8080</code>. Edit{' '}
                <code className="font-mono">src/config.ts</code> or{' '}
                <code className="font-mono">.env</code> to repoint at any Valyd environment.
              </p>
            </div>
            <ButtonLink
              href="https://github.com/valyd-id/valyd-sandbox-starter"
              variant="primary"
              size="lg"
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap"
            >
              View on GitHub
              <ExternalLink className="h-4 w-4 opacity-90" />
            </ButtonLink>
          </div>
        </section>
        )}

        {lane === null ? (
          <div
            key="empty"
            className="vd-rise rounded-xl border border-dashed border-(--vd-border) bg-gray-50/60 p-10 text-center dark:bg-slate-950/40"
            style={{ '--i': 5 } as React.CSSProperties}
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Pick a product to get started
            </h3>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-gray-100">Connect with Valyd</span>{' '}
              when a user connects their Valyd ID and you read their verified data.{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">Run a verification</span>{' '}
              to try a workflow live, or the Unique Human API from your backend — no login involved.
            </p>
          </div>
        ) : lane === 'verify' ? (
          <div key="verify" className="vd-rise space-y-6" style={{ '--i': 5 } as React.CSSProperties}>
            <Alert tone="info">
              <span className="font-semibold">Authenticated with your App API key</span> (
              <code className="font-mono">X-API-Key</code>) from the{' '}
              <a href={DEV_PORTAL_URL} className="font-medium underline" target="_blank" rel="noopener noreferrer">
                Developer Portal
              </a>
              . Unique Human API results come back to <em>your</em> system and nothing is saved;
              add a connected user's access token to a workflow run and passed proofs save to
              their Valyd ID.
            </Alert>
            <VerifyPlayground />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {[
                {
                  title: 'Liveness — anti-spoof check',
                  method: 'POST',
                  path: 'verify.sessions.create → antispoof check',
                  desc: "A no-account workflow session on Valyd's verification page — live camera burst, human_score verdict back to you. API key + workflowId, nothing saved.",
                  href: '/verifications/unique-human/antispoof'
                },
                {
                  title: 'Uniqueness — one face, one user',
                  method: 'POST',
                  path: 'verify.sessions.create → face_uniqueness check',
                  desc: "Match the captured face against the Valyd registry and get a stable valyd_uuid — catch duplicate accounts. API key + workflowId, no login, nothing saved.",
                  href: '/verifications/unique-human/face-uniqueness'
                },
                {
                  title: 'Run a verification workflow',
                  method: 'POST',
                  path: 'verify.sessions.create',
                  desc: 'Create a session for a configured workflow, send the connected user through it, and get the decision by signed webhook + decision endpoint.',
                  href: '/verifications/quickstart'
                }
              ].map(c => (
                <Link
                  key={c.title}
                  href={c.href}
                  className="group rounded-xl border border-(--vd-border) bg-white p-5 transition-all hover:border-(--vd-primary-border) hover:shadow-sm dark:bg-slate-950"
                >
                  <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-(--vd-border) bg-white px-2 py-1 dark:bg-slate-950">
                    <span className={cn('rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold', methodColors.POST)}>
                      {c.method}
                    </span>
                    <code className="font-mono text-[11px] text-gray-900 dark:text-gray-100">{c.path}</code>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{c.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{c.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-(--vd-primary) transition-all group-hover:gap-2.5">
                    Quickstart <ExternalLink className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
            <div className="rounded-xl border border-(--vd-border) bg-gray-50/60 px-5 py-4 text-sm leading-relaxed text-gray-600 dark:bg-slate-950/40 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                Want the result saved to the user's Valyd account?
              </span>{' '}
              That's Reusable Verification: connect the user first (Connect with Valyd), then
              create the workflow session with their access token — passed proofs save to their
              Valyd ID and are reusable across your apps.{' '}
              <Link href="/verifications" className="font-medium text-(--vd-primary) underline">
                Reusable Verification →
              </Link>
            </div>
          </div>
        ) : (
          <div key="oauth2" className="@container vd-rise space-y-6">
            {/* TOP: Credentials banner */}
            <div className="overflow-hidden rounded-xl border border-(--vd-border) bg-white shadow-sm dark:bg-slate-950">
              <div className="flex items-center gap-2 border-b border-(--vd-border) bg-slate-50 px-5 py-3 dark:bg-slate-900">
                <KeyRound className="h-3.5 w-3.5 text-(--vd-primary)" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Sandbox Credentials
                </h3>
                <span className="ml-auto text-[11px] text-gray-500 dark:text-gray-400">
                  Shared across every request below
                </span>
              </div>
              <div className="p-4">
                <CredentialsBlock />
              </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 @min-[880px]:grid-cols-[240px_minmax(0,1fr)_300px]">
              {/* LEFT: Endpoint list */}
              <aside className="overflow-hidden rounded-xl border border-(--vd-border) bg-white/80 shadow-sm backdrop-blur-sm @min-[880px]:sticky @min-[880px]:top-20 dark:bg-slate-950/80">
                <div className="border-b border-(--vd-border) px-4 py-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Endpoints
                  </h2>
                </div>
                <ul className="space-y-0.5 p-2">
                  {ENDPOINTS.map((ep, i) => {
                    const isActive = ep.key === active
                    const done = completed(ep.key)
                    return (
                      <li key={ep.key}>
                        <button
                          onClick={() => setActive(ep.key)}
                          className={cn(
                            'group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all',
                            isActive
                              ? 'bg-(--vd-primary-soft) text-gray-900 dark:text-gray-100'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-900'
                          )}
                        >
                          <span
                            className={cn(
                              'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors',
                              done
                                ? 'bg-emerald-500 text-white'
                                : isActive
                                  ? 'bg-(--vd-primary) text-white dark:text-slate-900'
                                  : 'bg-gray-100 text-gray-500 group-hover:bg-white dark:bg-slate-800 dark:text-gray-400 dark:group-hover:bg-slate-950'
                            )}
                          >
                            {done ? <Check className="h-3 w-3" /> : i + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{ep.label}</span>
                          </span>
                          <span
                            className={cn(
                              'shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold',
                              ep.method === 'GET'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                : 'bg-(--vd-primary-soft) text-(--vd-primary)'
                            )}
                          >
                            {ep.method}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </aside>

              {/* CENTER: Request + Response */}
              <section className="@container min-w-0 space-y-5">
                {/* Header card */}
                <div className="overflow-hidden rounded-xl border border-(--vd-border) bg-white shadow-sm dark:bg-slate-950">
                  <div className="border-b border-(--vd-border) bg-white px-6 py-5 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 @lg:flex-row @lg:items-start @lg:justify-between">
                      <div className="min-w-0 @lg:flex-1">
                        <div className="mb-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-mono">
                            Step {activeIndex + 1} of {ENDPOINTS.length}
                          </span>
                          <span>·</span>
                          <span>API Playground</span>
                        </div>
                        <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                          {activeMeta.label}
                        </h2>
                        <p className="mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                          {activeMeta.description}
                        </p>
                        <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-(--vd-border) bg-white px-2.5 py-1.5 dark:bg-slate-950">
                          <span
                            className={cn(
                              'rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold',
                              methodColors[activeMeta.method]
                            )}
                          >
                            {activeMeta.method}
                          </span>
                          <code className="break-all font-mono text-xs text-gray-900 dark:text-gray-100">
                            {activeMeta.path}
                          </code>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="md"
                        onClick={run}
                        disabled={isLoading || runDisabled}
                        title={runDisabled ? 'Fill in the required input first' : undefined}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 fill-current" />
                        )}
                        Send Request
                      </Button>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="space-y-4 px-6 py-4">
                    {active === 'exchange-token' && (
                      <PasteInput
                        label="Authorization code"
                        value={codeInput}
                        onChange={setCodeInput}
                        placeholder="Paste the code from Get Authorization Code"
                        hint="auto-filled when Step 1 runs"
                      />
                    )}
                    {(active === 'userinfo' ||
                      active === 'licenses' ||
                      active === 'verifications') && (
                      <PasteInput
                        label="Access token"
                        value={accessTokenInput}
                        onChange={setAccessTokenInput}
                        placeholder="Paste the access_token from Exchange Code for Token"
                        hint="auto-filled when Step 2 runs"
                      />
                    )}
                    {active === 'refresh' && (
                      <PasteInput
                        label="Refresh token"
                        value={refreshTokenInput}
                        onChange={setRefreshTokenInput}
                        placeholder="Paste the refresh_token from Exchange Code for Token"
                        hint="auto-filled when Step 2 runs"
                      />
                    )}
                    {active === 'issue-code' && (
                      <Alert tone="info">
                        Uses the Demo User and Scopes from the right panel. Tweak them and re-run to
                        compare responses.
                      </Alert>
                    )}

                    <SnippetTabs snippet={snippet} />
                  </div>
                </div>

                {/* Response card */}
                <div className="overflow-hidden rounded-xl border border-(--vd-border) bg-white shadow-sm dark:bg-slate-950">
                  <div className="flex items-center justify-between border-b border-(--vd-border) bg-slate-50 px-6 py-3 dark:bg-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Response
                      </h3>
                    </div>
                    {isLoading ? (
                      <span className="inline-flex items-center gap-1.5 rounded bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold text-gray-500 dark:bg-slate-800 dark:text-gray-400">
                        <Loader2 className="h-3 w-3 motion-safe:animate-spin" />
                        …
                      </span>
                    ) : (
                      activeResult && (
                        <span
                          className={cn(
                            'rounded px-2 py-0.5 font-mono text-xs font-semibold',
                            activeResult.ok
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                          )}
                        >
                          {activeResult.status === 0 ? 'ERR' : activeResult.status}
                        </span>
                      )
                    )}
                  </div>
                  <div className="space-y-4 p-5">
                    <JsonPanel
                      data={activeResult?.body ?? null}
                      ok={activeResult?.ok}
                      status={activeResult?.status}
                      loading={isLoading}
                      placeholder="Click Send Request to see the response here."
                    />

                    {active === 'exchange-token' && decodedIdToken !== null && !isLoading && (
                      <div className="pt-2">
                        <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Decoded id_token payload
                        </div>
                        <JsonPanel data={decodedIdToken} ok status={200} label="id_token" />
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* RIGHT: Configuration */}
              <aside className="space-y-4 @min-[880px]:sticky @min-[880px]:top-20">
                <DemoUserPicker value={demoUser} onChange={setDemoUser} />
                <ScopePicker selected={scopes} onChange={setScopes} />
                <div className="space-y-1.5 rounded-lg border border-(--vd-primary-border) bg-(--vd-primary-soft) px-3 py-2.5 text-[11px] text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-gray-100">
                    <Sparkles className="h-3 w-3 text-(--vd-primary)" />
                    Recommended scopes
                  </div>
                  <p className="leading-relaxed">
                    Start with{' '}
                    <code className="rounded border border-(--vd-border) bg-white px-1 py-0.5 font-mono text-[10px] dark:bg-slate-950">
                      profile verifications
                    </code>{' '}
                    — enough to exercise the license and verification endpoints.
                  </p>
                  <ul className="space-y-0.5 leading-relaxed">
                    <li>
                      • Add{' '}
                      <code className="rounded border border-(--vd-border) bg-white px-1 py-0.5 font-mono text-[10px] dark:bg-slate-950">
                        doctor_license
                      </code>{' '}
                      only when the <span className="font-medium">Doctor</span> demo user is
                      selected.
                    </li>
                  </ul>
                </div>
                <Alert tone="info">
                  Changing the Demo User or Scopes resets the flow so you start fresh from Step 1.
                </Alert>
              </aside>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
