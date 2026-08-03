'use client'

import { Sparkles } from 'lucide-react'
import { useAskAi } from './ask-ai-provider'

/** Same slot/pattern as ThemeToggle — rendered as Navbar children in app/layout.tsx. */
export function NavbarAskAiButton() {
  const { isOpen, toggle } = useAskAi()
  const label = isOpen ? 'Close Ask AI' : 'Ask AI about these docs'

  return (
    <button type="button" aria-label={label} title={label} onClick={toggle} className="vd-ask-ai-navbar-button">
      <Sparkles className="h-[18px] w-[18px]" aria-hidden />
      <span className="vd-ask-ai-navbar-label">Ask AI</span>
    </button>
  )
}
