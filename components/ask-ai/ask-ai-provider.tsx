'use client'

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

export type AskAiMessage = { role: 'user' | 'assistant'; content: string }

type AskAiContextValue = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  messages: AskAiMessage[]
  isStreaming: boolean
  error: string | null
  sendMessage: (content: string) => Promise<void>
}

const AskAiContext = createContext<AskAiContextValue | null>(null)

/**
 * Shared state for the Ask AI widget (floating bubble + navbar button both
 * read/write this) so they control one chat panel without prop drilling.
 * Messages are in-memory only — no persistence, cleared on page refresh.
 */
export function AskAiProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<AskAiMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  // React state updates aren't synchronous, so a fast double-submit (e.g.
  // Enter then an immediate click) can read a stale `isStreaming` and slip
  // through before a re-render disables the input. A ref is checked/set
  // synchronously, so it closes that race.
  const isSendingRef = useRef(false)

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || isSendingRef.current) return
      isSendingRef.current = true

      setError(null)
      const history = [...messages, { role: 'user', content: trimmed } satisfies AskAiMessage]
      setMessages([...history, { role: 'assistant', content: '' }])
      setIsStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal
        })

        if (!response.ok || !response.body) {
          throw new Error((await response.text()) || 'Ask AI is unavailable right now.')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''

        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          accumulated += decoder.decode(value, { stream: true })
          setMessages(prev => {
            const next = [...prev]
            next[next.length - 1] = { role: 'assistant', content: accumulated }
            return next
          })
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Something went wrong.')
        setMessages(prev => prev.slice(0, -1))
      } finally {
        setIsStreaming(false)
        abortRef.current = null
        isSendingRef.current = false
      }
    },
    [messages]
  )

  const value: AskAiContextValue = {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
    messages,
    isStreaming,
    error,
    sendMessage
  }

  return <AskAiContext.Provider value={value}>{children}</AskAiContext.Provider>
}

export function useAskAi(): AskAiContextValue {
  const context = useContext(AskAiContext)
  if (!context) throw new Error('useAskAi must be used within an AskAiProvider')
  return context
}
