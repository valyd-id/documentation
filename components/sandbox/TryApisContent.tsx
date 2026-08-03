'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Boxes,
  Check,
  ExternalLink,
  Fingerprint,
  KeyRound,
  Loader2,
  Lock,
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
import { DEFAULT_SCOPES, type DemoUser } from './constants'
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
    path: '/api/auth/tpsso/userinfo',
    description:
      "Returns the authenticated user's profile claims. Sends the access_token as `Authorization: Bearer …`."
  },
  {
    key: 'licenses',
    method: 'GET',
    label: 'Get Licenses',
    path: '/api/auth/tpsso/licenses',
    description:
      'Returns verified professional licenses (medical / nursing) attached to the user.'
  },
  {
    key: 'verifications',
    method: 'GET',
    label: 'Get Verifications',
    path: '/api/auth/tpsso/verifications',
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
  POST: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-900'
}

/** Safe accessors for the loosely-typed API bodies. */
const asString = (v: unknown): string | null => (typeof v === 'string' && v ? v : null)
const asObject = (v: unknown): Record<string, unknown> | null =>
  v !== null && typeof v === 'object' ? (v as Record<string, unknown>) : null

export const TryApisContent = () => {
  const [protocol, setProtocol] = useState<'oauth2' | 'oidc' | 'mcp' | null>(null)
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
        className="vd-rise relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-b from-(--vd-primary-soft) to-transparent px-6 py-12 sm:px-10 dark:border-gray-800"
        style={{ '--i': 0 } as React.CSSProperties}
      >
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-slate-900/70">
            <Sparkles className="h-3.5 w-3.5 text-(--vd-primary)" />
            <span className="text-xs font-semibold tracking-wide text-gray-700 dark:text-gray-300">
              Interactive Sandbox
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-gray-100">
            API Playground
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-400">
            Run real OAuth + OIDC requests against the Valyd sandbox. Pick a demo user, choose
            scopes, and walk through the full flow — from authorization code to userinfo — without
            writing a single line of code.
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
        {/* Protocol picker */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(
            [
              {
                id: 'oauth2',
                label: 'OAuth 2.0',
                desc: 'Authorization code flow with demo users and scopes.',
                icon: Shield,
                enabled: true
              },
              {
                id: 'oidc',
                label: 'OpenID Connect',
                desc: 'Identity layer on top of OAuth 2.0.',
                icon: Fingerprint,
                enabled: false
              },
              {
                id: 'mcp',
                label: 'MCP',
                desc: 'Model Context Protocol endpoints.',
                icon: Boxes,
                enabled: false
              }
            ] as const
          ).map((p, i) => {
            const Icon = p.icon
            const selected = protocol === p.id
            return (
              <button
                key={p.id}
                onClick={() => p.enabled && setProtocol('oauth2')}
                disabled={!p.enabled}
                className={cn(
                  'vd-rise group relative overflow-hidden rounded-xl border bg-white p-5 text-left transition-all dark:bg-slate-900',
                  selected
                    ? 'border-(--vd-primary) shadow-md ring-2 ring-(--vd-primary-border)'
                    : p.enabled
                      ? 'cursor-pointer border-gray-200 hover:border-(--vd-primary-border) hover:shadow-sm dark:border-gray-800'
                      : 'cursor-not-allowed border-gray-200 opacity-60 dark:border-gray-800'
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
                  {!p.enabled ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:bg-slate-800 dark:text-gray-400">
                      <Lock className="h-3 w-3" /> Coming soon
                    </span>
                  ) : selected ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-(--vd-primary-soft) px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-(--vd-primary)">
                      <Check className="h-3 w-3" /> Selected
                    </span>
                  ) : (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
                      Available
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

        {/* SDK starter repo */}
        <section
          className="vd-rise relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-indigo-50 via-white to-white p-6 sm:p-8 dark:border-gray-800 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900"
          style={{ '--i': 4 } as React.CSSProperties}
        >
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
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
                including <code className="font-mono">createLoginSession</code> /{' '}
                <code className="font-mono">verifyLoginSession</code> for CSRF. The full
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

        {protocol !== 'oauth2' ? (
          <div
            key="empty"
            className="vd-rise rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-10 text-center dark:border-gray-800 dark:bg-slate-900/40"
            style={{ '--i': 5 } as React.CSSProperties}
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Pick a protocol to get started
            </h3>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-gray-500 dark:text-gray-400">
              Select{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">OAuth 2.0</span> above
              to explore credentials, endpoints and run live requests.
            </p>
          </div>
        ) : (
          <div key="oauth2" className="vd-rise space-y-6">
            {/* TOP: Credentials banner */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-gray-200 bg-gradient-to-r from-(--vd-primary-soft) to-transparent px-5 py-3 dark:border-gray-800">
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

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)_300px]">
              {/* LEFT: Endpoint list */}
              <aside className="overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm lg:sticky lg:top-20 dark:border-gray-800 dark:bg-slate-900/80">
                <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
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
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
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
                                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'
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
              <section className="min-w-0 space-y-5">
                {/* Header card */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-slate-900">
                  <div className="border-b border-gray-200 bg-gradient-to-br from-white to-slate-50/50 px-6 py-5 dark:border-gray-800 dark:from-slate-900 dark:to-slate-950/50">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
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
                        <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 dark:border-gray-800 dark:bg-slate-950">
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
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-slate-50/80 to-white px-6 py-3 dark:border-gray-800 dark:from-slate-950/80 dark:to-slate-900">
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
              <aside className="space-y-4 lg:sticky lg:top-20">
                <DemoUserPicker value={demoUser} onChange={setDemoUser} />
                <ScopePicker selected={scopes} onChange={setScopes} />
                <div className="space-y-1.5 rounded-lg border border-(--vd-primary-border) bg-(--vd-primary-soft) px-3 py-2.5 text-[11px] text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-gray-100">
                    <Sparkles className="h-3 w-3 text-(--vd-primary)" />
                    Recommended scopes
                  </div>
                  <p className="leading-relaxed">
                    Start with{' '}
                    <code className="rounded border border-gray-200 bg-white px-1 py-0.5 font-mono text-[10px] dark:border-gray-800 dark:bg-slate-950">
                      profile verifications
                    </code>{' '}
                    — enough to exercise the license and verification endpoints.
                  </p>
                  <ul className="space-y-0.5 leading-relaxed">
                    <li>
                      • Add{' '}
                      <code className="rounded border border-gray-200 bg-white px-1 py-0.5 font-mono text-[10px] dark:border-gray-800 dark:bg-slate-950">
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
