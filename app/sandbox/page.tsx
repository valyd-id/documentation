import type { Metadata } from 'next'
import { TryApisContent } from '@/components/sandbox/TryApisContent'

export const metadata: Metadata = {
  title: 'Try the APIs',
  description:
    'Run real OAuth + OIDC requests against the Valyd sandbox. Pick a demo user, choose scopes, and walk through the full flow — from authorization code to userinfo — without writing a single line of code.'
}

export default function SandboxPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <TryApisContent />
    </div>
  )
}
