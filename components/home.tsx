import { SITE } from '@/lib/site'
import { Fragment, type ReactNode } from 'react'
import Image from 'next/image'
import {
  ArrowRight,
  BookText,
  Braces,
  Code2,
  Download,
  FileJson,
  Globe,
  KeyRound,
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
      {/* Same "VALYD + arrow" lockup, theme-swapped (navy on light, white on dark) so it
          renders at an identical width in both modes — matches the navbar logo. */}
      <Image src="/images/valyd-lockup-navy.png" alt="Valyd" className="vd-logo-light h-9 w-auto sm:h-10" width={3578} height={447} priority />
      <Image src="/images/valyd-lockup-white.png" alt="Valyd" className="vd-logo-dark h-9 w-auto sm:h-10" width={3578} height={447} priority />
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
          server.ts — both delivery modes, one API key
        </div>
        <div className="[&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!border-0 [&_pre]:!shadow-none">{children}</div>
      </div>
    </div>
  )
}

/**
 * Auth0-style alternating feature row: text on one side, a code card on the other.
 * `side` is where the CODE sits on large screens; stacks on mobile.
 */
export function ZigRow({
  title,
  kicker,
  body,
  cta,
  side = 'right',
  index = 1,
  children
}: {
  title: string
  kicker?: string
  body: ReactNode
  cta?: { href: string; label: string }
  side?: 'left' | 'right'
  index?: number
  children: ReactNode
}) {
  const text = (
    <div className="min-w-0">
      {kicker && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-(--vd-primary)">{kicker}</p>
      )}
      <h3 className="m-0 text-2xl font-bold tracking-tight">{title}</h3>
      <div className="vd-hero-sub mt-3 max-w-xl text-[15px] leading-relaxed">{body}</div>
      {cta && (
        <div className="mt-5">
          <ButtonLink href={cta.href} size="md" variant="primary">
            {cta.label} <ArrowRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
        </div>
      )}
    </div>
  )
  const code = (
    <div className="min-w-0 overflow-hidden rounded-(--vd-radius) border border-(--vd-border) bg-white shadow-lg shadow-cyan-900/5 dark:bg-slate-950 dark:shadow-black/30">
      <div className="[&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!border-0 [&_pre]:!shadow-none">{children}</div>
    </div>
  )
  return (
    <section className="vd-rise mx-auto grid max-w-6xl items-center gap-10 px-6 pt-24 sm:pt-28 lg:grid-cols-2 lg:gap-16" style={rise(index)}>
      {side === 'right' ? (<>{text}{code}</>) : (
        <>
          <div className="min-w-0 max-lg:order-2">{code}</div>
          <div className="min-w-0 max-lg:order-1">{text}</div>
        </>
      )}
    </section>
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
    <section className="vd-rise mx-auto max-w-6xl px-6 pt-24 sm:pt-28" style={rise(index)}>
      <h2 className="m-0 text-2xl font-bold tracking-tight">{title}</h2>
      {sub ? <p className="mb-6 mt-2 max-w-2xl text-[0.95rem] text-slate-500 dark:text-slate-400">{sub}</p> : <div className="mb-6" />}
      {children}
    </section>
  )
}

/* Two-axis picture of the verification model — REPLACES the code-carrying zig
   rows on the homepage with the real mental model, no code. Two choices:
   where the flow runs (delivery) × who ends up holding the data (ownership).
   The COLUMN (ownership) decides which product page you land on; the ROW
   (delivery) is just how you run it. Each cell links to its canonical page. */
const OWNERSHIP = [
  { key: 'reusable', label: 'Reusable on the Valyd ID', note: 'proofs stay with Valyd, saved to the user' },
  { key: 'yours', label: 'Full data returns to you', note: 'you store, protect, and delete it' }
] as const

const DELIVERY = [
  { key: 'hosted', label: 'Hosted page', note: 'we host the capture flow', Icon: Globe },
  { key: 'direct', label: 'Direct API', note: 'you build the UI, call REST', Icon: Code2 }
] as const

const MATRIX: Record<string, Record<string, { href: string; title: string; blurb: string }>> = {
  hosted: {
    reusable: { href: '/verifications/managed', title: 'Verify the user', blurb: 'Send the signed-in user to one page; proofs save to their Valyd ID.' },
    yours: { href: '/verifications/standalone', title: 'Hosted delivery', blurb: 'The same page, no login — the full result returns to your system.' }
  },
  direct: {
    reusable: { href: '/verifications/managed', title: 'Checks with the user token', blurb: 'Call REST with the user token; the proof still lands on their Valyd ID.' },
    yours: { href: '/verifications/standalone', title: 'Standalone checks', blurb: 'Call REST with just your API key; the data comes home to you.' }
  }
}

export function Matrix() {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[minmax(8rem,0.7fr)_1fr_1fr]">
        {/* column headers (ownership) — sm+ only; on mobile each cell self-labels */}
        <div className="max-sm:hidden" />
        {OWNERSHIP.map(o => (
          <div key={o.key} className="max-sm:hidden px-1 pb-1">
            <p className="m-0 text-sm font-semibold">{o.label}</p>
            <p className="m-0 mt-0.5 text-xs text-slate-500 dark:text-slate-400">{o.note}</p>
          </div>
        ))}
        {/* body rows (delivery) */}
        {DELIVERY.map(({ key: dk, label: dl, note: dn, Icon }) => (
          <Fragment key={dk}>
            <div className="max-sm:hidden flex flex-col justify-center px-1">
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <Icon className="h-4 w-4 text-(--vd-primary)" aria-hidden /> {dl}
              </span>
              <span className="mt-0.5 pl-6 text-xs text-slate-500 dark:text-slate-400">{dn}</span>
            </div>
            {OWNERSHIP.map(o => {
              const cell = MATRIX[dk][o.key]
              return (
                <a
                  key={o.key}
                  href={cell.href}
                  className="group flex h-full flex-col rounded-(--vd-radius) border border-(--vd-border) bg-white/60 p-4 no-underline transition-all hover:border-(--vd-primary-border) hover:bg-(--vd-primary-soft) motion-safe:hover:-translate-y-0.5 dark:bg-slate-900/40"
                >
                  <span className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-(--vd-primary) sm:hidden">
                    {dl} · {o.label}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    {cell.title}
                    <ArrowRight className="h-3.5 w-3.5 text-(--vd-primary) transition-transform motion-safe:group-hover:translate-x-0.5" aria-hidden />
                  </span>
                  <span className="mt-1 text-xs leading-snug text-slate-500 dark:text-slate-400">{cell.blurb}</span>
                </a>
              )
            })}
          </Fragment>
        ))}
      </div>
      {/* the reuse path: no new check — just read what the account already holds */}
      <a
        href="/docs"
        className="group mt-3 flex items-center gap-3 rounded-(--vd-radius) border border-(--vd-primary-border) bg-(--vd-primary-soft) px-4 py-3 no-underline transition-colors"
      >
        <KeyRound className="h-4 w-4 shrink-0 text-(--vd-primary)" aria-hidden />
        <span className="text-sm text-slate-600 dark:text-slate-300">
          <b className="text-slate-800 dark:text-slate-100">Already verified elsewhere?</b> Add{' '}
          <span className="font-semibold text-(--vd-primary)">Login with Valyd</span> and read the proofs a
          signed-in user already holds — no new check.
        </span>
        <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-(--vd-primary) transition-transform motion-safe:group-hover:translate-x-0.5" aria-hidden />
      </a>
    </div>
  )
}

/* Two-column capability panel: Login endpoints + Verification checks.
   Every value comes from the docs (endpoints page / Standalone checks page / scopes). */
const ENDPOINTS = [
  ['GET', '/oidc/authorize', 'Standard OIDC authorization (code + state echo)'],
  ['POST', '/oidc/token', 'Exchange a code or refresh token for tokens'],
  ['GET', '/oidc/userinfo', 'Profile claims for the signed-in user'],
  ['GET', '/oidc/licenses', 'Verified professional licenses'],
  ['GET', '/oidc/verifications', 'Identity verification results']
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
          Login with Valyd — the user's account
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
          Verification API — every check
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
          Authenticate your backend with an App API key — run them hosted or call REST directly.
          Add the signed-in user's token and the passed proof saves to their account; without it,
          the result and the person's identity data return to your system to manage yourself.
        </p>
      </div>
    </div>
  )
}

/* The three integration steps, copy from the original landing page. */
const STEPS = [
  {
    title: 'Create an app',
    body: 'An app gives you both credentials: an API key for verification and OIDC client credentials for sign-in. Never want login? A verification-only project gives you just the key.'
  },
  {
    title: 'Pick what you need',
    body: 'Recommended: sign the user in and verify into their account — you read proofs, Valyd holds their data. API-key-only checks also work; the raw result then lives in your system, yours to manage.'
  },
  {
    title: 'Integrate and ship',
    body: 'Copy the matching quickstart, test with your $100 welcome credit, and go live with the production checklist.'
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
  { href: '/openapi/valyd-id.json', icon: FileJson, label: 'OpenAPI — Valyd ID', desc: 'Machine-readable spec for OIDC + resource endpoints' },
  { href: '/openapi/valyd-verify.json', icon: FileJson, label: 'OpenAPI — Verify', desc: 'Sessions, standalone checks, webhooks' },
  { href: '/valyd-postman-collection.json', icon: Send, label: 'Postman collection', desc: 'Ready-to-run Valyd ID requests' },
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
