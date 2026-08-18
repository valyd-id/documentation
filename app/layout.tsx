import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import Image from 'next/image'
import { ThemeToggle } from '@/components/theme-toggle'
import { AskAiProvider } from '@/components/ask-ai/ask-ai-provider'
import { AskAiChatPanel } from '@/components/ask-ai/chat-panel'
import { FloatingAskAiButton } from '@/components/ask-ai/floating-button'
import { NavbarAskAiButton } from '@/components/ask-ai/navbar-button'
import 'nextra-theme-docs/style.css'
import './globals.css'

import { SITE } from '@/lib/site'

const SITE_URL = SITE.docsUrl
const DESCRIPTION =
  'Developer documentation for Valyd: Login with Valyd (OAuth 2.0 / OIDC), the identity Verification APIs (KYC, liveness, face match, license), and MCP for AI agents. Quick starts, SDKs, and full API reference.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Valyd Developer Docs — Login, Verification APIs & MCP',
    template: '%s — Valyd Docs'
  },
  description: DESCRIPTION,
  authors: [{ name: 'Valyd' }],
  icons: { icon: '/favicon.png', apple: '/favicon.png' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'Valyd Developer Docs — Login, Verification APIs & MCP',
    description: DESCRIPTION,
    images: [`${SITE_URL}/favicon.png`]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Valyd Developer Docs — Login, Verification APIs & MCP',
    description: DESCRIPTION
  }
}

const navbar = (
  <Navbar
    logo={
      <span className="vd-logo" aria-label="Valyd documentation home">
        {/* Original brand assets: navy wordmark on light, white mark on dark */}
        <Image src="/images/valyd-wordmark.png" alt="Valyd" className="vd-logo-light" width={574} height={79} priority />
        <Image src="/images/valyd-mark.png" alt="Valyd" className="vd-logo-dark" width={1920} height={691} priority />
        <span className="vd-logo-docs">Docs</span>
      </span>
    }
    projectLink={SITE.devUrl}
  >
    <NavbarAskAiButton />
    {/* Single-button light/dark toggle, immediately right of the project link */}
    <ThemeToggle />
  </Navbar>
)

const footer = (
  <Footer>
    © {new Date().getFullYear()} Valyd. All rights reserved. ·{' '}
    <a href={SITE.devUrl} target="_blank" rel="noreferrer">
      Developer Portal
    </a>{' '}
    · Contact <a href="mailto:support@valyd.id">support@valyd.id</a>
  </Footer>
)

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      {/* Valyd brand cyan as the theme hue — the only visual customization */}
      <Head color={{ hue: 196, saturation: 100 }} />
      <body>
        <AskAiProvider>
          <Layout
            navbar={navbar}
            pageMap={await getPageMap()}
            footer={footer}
            editLink={null}
            feedback={{ content: null }}
          >
            {children}
          </Layout>
          <FloatingAskAiButton />
          <AskAiChatPanel />
        </AskAiProvider>
      </body>
    </html>
  )
}
