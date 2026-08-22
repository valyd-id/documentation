'use client'

import React, { useEffect, useState } from 'react'
import { ExternalLink, KeyRound, Play, ShieldCheck } from 'lucide-react'
import { SANDBOX_BASE_URL } from './constants'

/**
 * Live hosted-verification tester: the developer pastes their own API key +
 * workflow id (and optionally a user's valyd_access_token), we create a real
 * session straight from the browser (the API allows the docs origin) and redirect
 * to the hosted page. The key never touches the docs server.
 */
export const VerifyPlayground = () => {
  const [apiKey, setApiKey] = useState('')
  const [workflowId, setWorkflowId] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameBack, setCameBack] = useState(false)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get('verify_done')) setCameBack(true)
  }, [])

  // Same-origin with /demos after the mount: persist under the exact key the demos
  // app reads (`valyd_demo_api_key`) so the demos pick it up with no handoff code.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = window.localStorage.getItem('valyd_demo_api_key')
      if (saved && !apiKey) setApiKey(saved)
    } catch { /* private mode */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (apiKey.trim()) window.localStorage.setItem('valyd_demo_api_key', apiKey.trim())
    } catch { /* private mode */ }
  }, [apiKey])

  const go = async () => {
    setError(null)
    setBusy(true)
    try {
      const body: Record<string, unknown> = {
        workflow_id: workflowId.trim(),
        redirect_url: `${window.location.origin}/sandbox?verify_done=1`,
        vendor_data: 'docs-playground'
      }
      const token = accessToken.trim()
      if (token) body.valyd_access_token = token
      const res = await fetch(`${SANDBOX_BASE_URL}/api/v2/session`, {
        method: 'POST',
        headers: { 'X-API-Key': apiKey.trim(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success || !json?.data?.url) {
        const code = json?.error?.code ?? `http_${res.status}`
        const msg = json?.error?.message ?? 'Could not create the session.'
        setError(`${code} — ${msg}`)
        return
      }
      window.location.href = json.data.url as string
    } catch {
      setError('network_error — could not reach the API. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  const ready = apiKey.trim().length > 0 && workflowId.trim().length > 0

  const inputCls =
    'w-full rounded-lg border border-(--vd-border) bg-white px-3 py-2 font-mono text-[13px] text-gray-900 placeholder:font-sans placeholder:text-gray-400 focus:border-(--vd-primary-border) focus:outline-none dark:bg-slate-950 dark:text-gray-100'

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-(--vd-border) bg-white p-5 sm:p-6 dark:bg-slate-950">
        <div className="mb-1 flex items-center gap-2">
          <Play className="h-4 w-4 text-(--vd-primary)" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Run it now — with your keys
          </h3>
        </div>
        <p className="mb-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          Paste your API key and a workflow id, hit <span className="font-medium">Go</span>, and
          you&apos;re on your own hosted verification page running the full flow. Your key stays in
          this browser — the call goes straight to the API.
        </p>
        <p className="mb-4 rounded-lg border border-(--vd-border) bg-gray-50/70 px-3.5 py-2.5 text-xs leading-relaxed text-gray-600 dark:bg-slate-900/50 dark:text-gray-400">
          Don&apos;t have these yet?{' '}
          <a href="/verifications/setup" className="font-medium text-(--vd-primary) underline">Create a verification-only project</a>{' '}
          to get your <span className="font-medium">API key</span>, then{' '}
          <a href="/verifications/workflows" className="font-medium text-(--vd-primary) underline">compose a workflow</a>{' '}
          to get its <span className="font-medium">workflow id</span>. New accounts start with a{' '}
          <a href="/docs/testing" className="font-medium text-(--vd-primary) underline">$100 credit</a>.
        </p>

        {cameBack && (
          <div className="mb-4 rounded-lg border border-emerald-300/60 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="font-semibold">Welcome back — the hosted flow finished.</span> The
            redirect is only a hint: read the authoritative result from your webhook or the
            decision endpoint (<code className="font-mono text-[12px]">GET /api/v2/session/&#123;id&#125;/decision</code>).
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
              API key <span className="font-normal text-gray-400">(verification-only project, or an app&apos;s Verification tab)</span>
            </span>
            <input
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="vk_live_…"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Workflow id <span className="font-normal text-gray-400">(from your project&apos;s Workflows tab)</span>
            </span>
            <input
              value={workflowId}
              onChange={e => setWorkflowId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className={inputCls}
            />
          </label>
        </div>

        {showToken ? (
          <label className="mt-3 block">
            <span className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
              User&apos;s <code className="font-mono">valyd_access_token</code>{' '}
              <span className="font-normal text-gray-400">(optional)</span>
            </span>
            <input
              type="password"
              autoComplete="off"
              value={accessToken}
              onChange={e => setAccessToken(e.target.value)}
              placeholder="paste an access token from a Login with Valyd session"
              className={inputCls}
            />
            <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
              With a token the run is tied to that user: steps their account already passed are
              skipped, and passed proofs save to their Valyd ID — you get proofs, not PII.
            </span>
          </label>
        ) : (
          <button
            type="button"
            onClick={() => setShowToken(true)}
            className="mt-3 flex w-fit items-center gap-1.5 text-sm font-medium text-(--vd-primary) hover:underline"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Running it for a signed-in user? Add their access token
          </button>
        )}

        {error && (
          <div className="mt-3 rounded-lg border border-red-300/60 bg-red-50 px-4 py-2.5 font-mono text-[13px] text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={!ready || busy}
          onClick={go}
          className="mt-4 flex w-fit items-center gap-2 rounded-lg bg-(--vd-primary) px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          title={ready ? undefined : 'Paste your API key and workflow id first'}
        >
          <Play className="h-4 w-4" />
          {busy ? 'Creating session…' : 'Go — open my hosted flow'}
        </button>
      </section>

      <section className="rounded-xl border border-(--vd-border) bg-white p-5 sm:p-6 dark:bg-slate-950">
        <div className="mb-1 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-(--vd-primary)" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Ready-made UI demos — running on your key
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          We&apos;ve built ready-made verification UIs you can try — and copy for your own side.
          The key above <em>carries over</em>: open the demos and they run on <em>your</em> key —
          the fastest way to see a working UI and confirm your key is live.
        </p>
        <a
          href="/demos"
          className="mt-3 flex w-fit items-center gap-1.5 text-sm font-medium text-(--vd-primary) transition-all hover:gap-2.5"
        >
          Open the demos on my key <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </section>
    </div>
  )
}
