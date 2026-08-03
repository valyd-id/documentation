'use client'

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import Link from 'next/link'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bot, Send, User, X } from 'lucide-react'
import { useAskAi } from './ask-ai-provider'

// Answers include headings, tables, and code blocks (GFM), not just prose —
// render the real thing rather than a hand-rolled subset.
const markdownComponents: Components = {
  a: ({ href, children }) =>
    href ? (
      <Link href={href} className="vd-ask-ai-link">
        {children}
      </Link>
    ) : (
      <>{children}</>
    )
}

function renderMessageContent(content: string) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {content}
    </ReactMarkdown>
  )
}

export function AskAiChatPanel() {
  const { isOpen, close, messages, isStreaming, error, sendMessage } = useAskAi()
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

  // Auto-grow the input as the user types, instead of scrolling text
  // sideways inside a fixed single line.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }, [draft])

  if (!isOpen) return null

  const submitDraft = () => {
    if (!draft.trim() || isStreaming) return
    void sendMessage(draft)
    setDraft('')
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    submitDraft()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submitDraft()
    }
  }

  return (
    <div className="vd-ask-ai-panel" role="dialog" aria-label="Ask AI about these docs">
      <div className="vd-ask-ai-panel-header">
        <span className="vd-ask-ai-panel-title">
          <Bot className="h-4 w-4" aria-hidden /> Ask AI
        </span>
        <button type="button" aria-label="Close Ask AI" onClick={close} className="vd-ask-ai-panel-close">
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="vd-ask-ai-panel-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <p className="vd-ask-ai-empty">
            Ask a question about Valyd&apos;s docs — logins, verification APIs, MCP, and more.
          </p>
        )}
        {messages.map((message, idx) => (
          <div key={idx} className={`vd-ask-ai-message vd-ask-ai-message-${message.role}`}>
            <span className="vd-ask-ai-message-icon" aria-hidden>
              {message.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </span>
            <div className="vd-ask-ai-message-body">
              {message.content ? (
                renderMessageContent(message.content)
              ) : isStreaming && idx === messages.length - 1 ? (
                <span className="vd-spinner" aria-label="Thinking" />
              ) : null}
            </div>
          </div>
        ))}
        {error && <p className="vd-ask-ai-error">{error}</p>}
      </div>

      <form onSubmit={handleSubmit} className="vd-ask-ai-form">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={event => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about the docs…"
          aria-label="Ask a question about the docs"
          className="vd-ask-ai-input"
          rows={1}
          disabled={isStreaming}
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={isStreaming || !draft.trim()}
          className="vd-ask-ai-send"
        >
          <Send className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </div>
  )
}
