'use client'

import { Sparkles, X } from 'lucide-react'
import { useAskAi } from './ask-ai-provider'

/**
 * Fixed-position launcher, rendered as a sibling to page content in the root
 * layout so it floats over every route — including the sidebar-less home
 * page — regardless of that page's Nextra theme overrides.
 */
export function FloatingAskAiButton() {
  const { isOpen, toggle } = useAskAi()
  const label = isOpen ? 'Close Ask AI' : 'Ask AI about these docs'

  return (
    <button type="button" aria-label={label} title={label} onClick={toggle} className="vd-ask-ai-fab">
      {isOpen ? <X className="h-5 w-5" aria-hidden /> : <Sparkles className="h-5 w-5" aria-hidden />}
    </button>
  )
}
