import { SITE } from '@/lib/site'
import type { ReactNode } from 'react'
import Image from 'next/image'
import {
  ArrowRight,
  BookText,
  Braces,
  Download,
  FileJson,
  ScanFace,
  Send,
  Terminal
} from 'lucide-react'
import { ButtonLink } from './ui/button'

/**
 * Homepage building blocks, composed from content/index.mdx. Server
 * components; motion is the CSS `vd-rise` cascade + hover transitions from
 * globals.css (all reduced-motion-gated).
 */

const rise = (i: number) => ({ '--i': i }) as React.CSSProperties

export function HeroGrid({ children }: { children: ReactNode }) {
  return (
    <header className="vd-hero-bg relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-14 pt-14 sm:pt-18 lg:grid-cols-[1.1fr_0.9fr]">
        {children}
      </div>
    </header>
  )
}

export function Hero({
  title,
  children,
  primary,
  secondary
}: {
  title: string
  children: ReactNode
  primary: { href: string; label: string }
  secondary: { href: string; label: string }
}) {
  return (
    <div className="vd-rise" style={rise(0)}>
      {/* Original brand wordmark, theme-swapped (navy on light, white on dark) */}
      <Image src="/images/valyd-wordmark.png" alt="Valyd" className="vd-logo-light h-9 w-auto sm:h-10" width={574} height={79} priority />
      <Image src="/images/valyd-mark.png" alt="Valyd" className="vd-logo-dark h-9 w-auto sm:h-10" width={1920} height={691} priority />
      <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
        {title}
      </h1>
      <div className="vd-hero-sub mt-5 max-w-xl text-base leading-relaxed sm:text-lg">{children}</div>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <ButtonLink href={primary.href} size="lg">
          {primary.label}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
        <ButtonLink href={secondary.href} size="lg" variant="secondary">
          {secondary.label}
        </ButtonLink>
      </div>
    </div>
  )
}

/** API request preview card — children is a real MDX code fence. */
export function HeroCode({ children }: { children: ReactNode }) {
  return (
    <div className="vd-rise max-lg:hidden" style={rise(1)}>
      <div className="overflow-hidden rounded-(--vd-radius) border border-(--vd-border) bg-white shadow-lg shadow-cyan-900/5 dark:bg-slate-950 dark:shadow-black/30">
        <div className="flex items-center gap-2 border-b border-(--vd-border) bg-(--vd-surface) px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Terminal className="h-3.5 w-3.5" aria-hidden />
          server.ts — Login with Valyd
        </div>
        <div className="[&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!border-0 [&_pre]:!shadow-none">{children}</div>
      </div>
    </div>
  )
}

export function Section({
  title,
  sub,
  index = 1,
  children
}: {
  title: string
  sub?: string
  index?: number
  children: ReactNode
}) {
  return (
    <section className="vd-rise mx-auto max-w-6xl px-6 pt-16" style={rise(index)}>
      <h2 className="m-0 text-2xl font-bold tracking-tight">{title}</h2>
      {sub ? <p className="mb-6 mt-2 max-w-2xl text-[0.95rem] text-slate-500 dark:text-slate-400">{sub}</p> : <div className="mb-6" />}
      {children}
    </section>
  )
}

/* Two-column capability panel: Login endpoints + Verification checks.
   Every value comes from the docs (endpoints page / Core APIs page / scopes). */
const ENDPOINTS = [
  ['POST', '/token', 'Exchange an authorization code for tokens'],
  ['GET', '/userinfo', 'Profile claims for the signed-in user'],
  ['GET', '/licenses', 'Verified professional licenses'],
  ['GET', '/verifications', 'Identity verification results'],
  ['POST', '/refresh', 'Refresh an expired access token']
] as const

const CHECKS = [
  'ID Verification',
  'Liveness',
  'Face Match',
  'Age Verification',
  'Credential Verification',
  'KYC + Credential',
  'Location'
] as const

const SCOPES = ['profile', 'verifications', 'doctor_license', 'zkp', 'mcp'] as const

export function Capabilities() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-(--vd-radius) border border-(--vd-border) bg-white/60 p-6 dark:bg-slate-900/40">
        <h3 className="m-0 flex items-center gap-2 text-base font-semibold">
          <Braces className="h-4 w-4 text-(--vd-primary)" aria-hidden />
          Login with Valyd — TPSSO endpoints
        </h3>
        <ul className="m-0 mt-4 list-none space-y-1 p-0">
          {ENDPOINTS.map(([method, path, desc]) => (
            <li key={path} className="flex items-baseline gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-(--vd-primary-soft)">
              <span className="w-11 shrink-0 font-mono text-[11px] font-bold text-(--vd-primary)">{method}</span>
              <code className="shrink-0 bg-transparent p-0 font-mono text-[13px]">{path}</code>
              <span className="truncate text-slate-500 dark:text-slate-400 max-sm:hidden">{desc}</span>
            </li>
          ))}
        </ul>
        <p className="mb-0 mt-4 text-xs text-slate-500 dark:text-slate-400">
          Scopes:{' '}
          {SCOPES.map(s => (
            <code key={s} className="mr-1.5 rounded bg-(--vd-primary-soft) px-1.5 py-0.5 font-mono text-[11px]">
              {s}
            </code>
          ))}
        </p>
      </div>
      <div className="rounded-(--vd-radius) border border-(--vd-border) bg-white/60 p-6 dark:bg-slate-900/40">
        <h3 className="m-0 flex items-center gap-2 text-base font-semibold">
          <ScanFace className="h-4 w-4 text-(--vd-primary)" aria-hidden />
          Verification checks — Core APIs
        </h3>
        <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
          {CHECKS.map(c => (
            <li
              key={c}
              className="rounded-full border border-(--vd-border) px-3 py-1.5 text-[13px] font-medium transition-colors hover:border-(--vd-primary-border) hover:bg-(--vd-primary-soft)"
            >
              {c}
            </li>
          ))}
        </ul>
        <p className="mb-0 mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Run them hosted (Valyd renders the capture UI) or call the REST APIs directly from your
          backend. Every response uses the same envelope, and keys stay server-side.
        </p>
      </div>
    </div>
  )
}

/* The three integration steps, copy from the original landing page. */
const STEPS = [
  {
    title: 'Create an app',
    body: 'Sign up at the developer portal and create an app. It gives you your OAuth client (client_id / client_secret) and your verification API key — one place, all credentials.'
  },
  {
    title: 'Pick what you need',
    body: 'Login with Valyd for sign-in, the verification APIs for checks, or MCP for agents. Mix them: many apps log the user in, then run a verification against that account.'
  },
  {
    title: 'Integrate and ship',
    body: 'Use the SDKs or call the REST endpoints. Every response is the same envelope, keys stay server-side, and the sandbox lets you try calls before you write code.'
  }
] as const

export function Steps() {
  return (
    <ol className="m-0 grid list-none gap-4 p-0 sm:grid-cols-3">
      {STEPS.map((s, i) => (
        <li key={s.title} className="relative rounded-(--vd-radius) border border-(--vd-border) bg-white/60 p-6 transition-colors hover:border-(--vd-primary-border) dark:bg-slate-900/40">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--vd-primary-soft) text-sm font-bold text-(--vd-primary)">
            {i + 1}
          </span>
          <h3 className="mb-2 mt-4 text-base font-semibold">{s.title}</h3>
          <p className="m-0 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{s.body}</p>
        </li>
      ))}
    </ol>
  )
}

/* Developer resources: every target is a real, served asset or page. */
const RESOURCES = [
  { href: '/openapi/valyd-id.json', icon: FileJson, label: 'OpenAPI — Valyd ID', desc: 'Machine-readable spec for TPSSO + OIDC' },
  { href: '/openapi/valyd-verify.json', icon: FileJson, label: 'OpenAPI — Verify', desc: 'Sessions, core checks, webhooks' },
  { href: '/valyd-postman-collection.json', icon: Send, label: 'Postman collection', desc: 'Ready-to-run TPSSO requests' },
  { href: '/downloads/valyd-sdk-starter.zip', icon: Download, label: 'SDK starter project', desc: 'Minimal Express app with @valyd/sdk' },
  { href: '/llms.txt', icon: BookText, label: 'llms.txt', desc: 'Agent-readable index of these docs' }
] as const

export function Resources() {
  return (
    <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-5">
      {RESOURCES.map(({ href, icon: Icon, label, desc }) => (
        <li key={href} className="m-0">
          <a
            href={href}
            className="group flex h-full flex-col gap-2 rounded-(--vd-radius) border border-(--vd-border) p-4 no-underline transition-all hover:border-(--vd-primary-border) hover:bg-(--vd-primary-soft) motion-safe:hover:-translate-y-0.5"
          >
            <Icon className="h-4 w-4 text-(--vd-primary) transition-transform motion-safe:group-hover:-translate-y-px" aria-hidden />
            <span className="text-[13px] font-semibold leading-tight">{label}</span>
            <span className="text-xs leading-snug text-slate-500 dark:text-slate-400">{desc}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export function SupportBand() {
  return (
    <section className="vd-rise mx-auto max-w-6xl px-6 py-16" style={rise(2)}>
      <div className="flex flex-col items-start justify-between gap-6 rounded-(--vd-radius) border border-(--vd-primary-border) bg-(--vd-primary-soft) p-8 sm:flex-row sm:items-center">
        <div>
          <h2 className="m-0 text-xl font-bold tracking-tight">Need a hand?</h2>
          <p className="m-0 mt-1.5 text-sm text-slate-600 dark:text-slate-300">
            Email{' '}
            <a href="mailto:support@valyd.id" className="font-medium text-(--vd-primary)">
              support@valyd.id
            </a>{' '}
            or manage your apps and credentials in the developer portal.
          </p>
        </div>
        <ButtonLink href={SITE.devUrl} target="_blank" rel="noreferrer">
          Open the Developer Portal
          <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
      </div>
    </section>
  )
}
