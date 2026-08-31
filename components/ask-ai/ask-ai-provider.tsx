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
  // The docs-agent keeps conversation memory server-side, keyed by an id it mints
  // on the first answer. We store it here and echo it back so follow-up questions
  // continue the same conversation. Cleared on refresh (in-memory only).
  const conversationIdRef = useRef<string | null>(null)
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
      // Only send real turns. A previous answer that came back empty (or a turn that
      // failed) can leave a blank assistant message in state; including it would make the
      // API reject the whole request ("messages must be non-empty"). Drop any blanks, and
      // keep the tail within the server's per-request limits (20 messages / 32k chars).
      const priorTurns = messages.filter(message => message.content.trim().length > 0)
      const history = [...priorTurns, { role: 'user', content: trimmed } satisfies AskAiMessage].slice(-18)
      setMessages([...history, { role: 'assistant', content: '' }])
      setIsStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history, conversation_id: conversationIdRef.current ?? undefined }),
          signal: controller.signal
        })

        if (!response.ok || !response.body) {
          throw new Error((await response.text()) || 'Ask AI is unavailable right now.')
        }

        // The server threads the docs-agent conversation id back on a header.
        const cid = response.headers.get('X-Conversation-Id')
        if (cid) conversationIdRef.current = cid

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

        // A 200 that streamed nothing must not leave a blank assistant bubble in state —
        // it would be sent on the next turn and get the whole request rejected. Drop it
        // and surface a plain message instead.
        if (!accumulated.trim()) {
          setMessages(prev => prev.slice(0, -1))
          setError('No answer came back. Please try again.')
        }
      } catch (err) {
        // Never leave the blank assistant placeholder behind, on any failure (abort included).
        setMessages(prev => (prev.at(-1)?.content ? prev : prev.slice(0, -1)))
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Something went wrong.')
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
