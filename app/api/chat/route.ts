import type { NextRequest } from 'next/server'

// Node runtime: we proxy to the docs-agent service and stream its response.
export const runtime = 'nodejs'

// The Valyd Docs Agent (RAG over the docs, ChromaDB + streaming answers).
// Overridable per environment; defaults to the dev deployment.
const DOCS_AGENT_URL = (process.env.DOCS_AGENT_URL || 'https://docs-agent.valyd.work').replace(/\/$/, '')

type ChatMessage = { role: 'user' | 'assistant'; content: string }

const MAX_MESSAGES = 20
const MAX_USER_MESSAGE_LENGTH = 4000
const MAX_ASSISTANT_MESSAGE_LENGTH = 8000
const MAX_BODY_BYTES = 64 * 1024
const MAX_HISTORY_LENGTH = 32_000
// docs-agent caps a question at 1000 chars (schemas.MAX_QUESTION_LENGTH); mirror it here.
const MAX_QUESTION_LENGTH = 1000

// This is a public, unauthenticated endpoint that drives a paid LLM API (via the
// docs-agent). Guard it with a per-IP token bucket so one client can't rack up
// spend. In-memory (per server process) — fine for a single PM2 instance.
const RATE_MAX = Math.min(100, Math.max(1, Number(process.env.CHAT_RATE_MAX) || 20))
const RATE_WINDOW_MS = Math.min(3_600_000, Math.max(1_000, Number(process.env.CHAT_RATE_WINDOW_MS) || 60_000))
const buckets = new Map<string, { count: number; reset: number }>()

function clientIp(request: NextRequest): string {
  // The reverse proxy must overwrite this header. Never trust the left-most
  // X-Forwarded-For value supplied by an internet client.
  return (request.headers.get('x-real-ip') || 'unknown').slice(0, 64)
}

function checkRateLimit(request: NextRequest): boolean {
  const ip = clientIp(request)
  const now = Date.now()
  const b = buckets.get(ip)
  if (!b || now > b.reset) {
    buckets.set(ip, { count: 1, reset: now + RATE_WINDOW_MS })
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (now > v.reset) buckets.delete(k)
    }
    return true
  }
  if (b.count >= RATE_MAX) return false
  b.count++
  return true
}

function isValidMessages(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= MAX_MESSAGES &&
    value.every(
      message =>
        message &&
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.content === 'string' &&
        message.content.length > 0 &&
        message.content.length <=
          (message.role === 'user' ? MAX_USER_MESSAGE_LENGTH : MAX_ASSISTANT_MESSAGE_LENGTH)
    ) &&
    value.reduce((total, message) => total + message.content.length, 0) <= MAX_HISTORY_LENGTH
  )
}

type SseFrame = { event: string; data: string }

/** Parse one raw SSE block ("event: x\ndata: y") into { event, data }. */
function parseFrame(raw: string): SseFrame | null {
  let event = 'message'
  const dataLines: string[] = []
  for (const line of raw.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim()
    else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim())
  }
  if (dataLines.length === 0) return null
  return { event, data: dataLines.join('\n') }
}

/** Find the next SSE frame boundary, handling both LF (\n\n) and CRLF (\r\n\r\n). */
function nextBoundary(buf: string): { idx: number; len: number } | null {
  const lf = buf.indexOf('\n\n')
  const crlf = buf.indexOf('\r\n\r\n')
  if (crlf === -1 && lf === -1) return null
  if (crlf === -1) return { idx: lf, len: 2 }
  if (lf === -1) return { idx: crlf, len: 4 }
  return crlf < lf ? { idx: crlf, len: 4 } : { idx: lf, len: 2 }
}

/** Turn the docs-agent SSE byte stream into a sequence of parsed frames. */
async function* readFrames(body: ReadableStream<Uint8Array>): AsyncGenerator<SseFrame> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const boundary = nextBoundary(buffer)
    if (!boundary) {
      const { done, value } = await reader.read()
      if (done) {
        const rest = buffer.trim()
        if (rest) {
          const f = parseFrame(rest)
          if (f) yield f
        }
        return
      }
      buffer += decoder.decode(value, { stream: true })
      continue
    }
    const raw = buffer.slice(0, boundary.idx)
    buffer = buffer.slice(boundary.idx + boundary.len)
    const f = parseFrame(raw)
    if (f) yield f
  }
}

/** Call docs-agent. Retries once without a stale conversation id (server may have swept it). */
async function callDocsAgent(question: string, conversationId: string | null): Promise<Response> {
  const send = (cid: string | null) =>
    fetch(`${DOCS_AGENT_URL}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify(cid ? { question, conversation_id: cid } : { question })
    })

  let res = await send(conversationId)
  // A conversation id the agent no longer knows is a 400 — drop it and start fresh.
  if (res.status === 400 && conversationId) res = await send(null)
  return res
}

export async function POST(request: NextRequest) {
  if (!checkRateLimit(request)) {
    return new Response('Rate limit exceeded — please wait a moment and try again.', {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(RATE_WINDOW_MS / 1000)) }
    })
  }

  let body: unknown
  try {
    const declaredLength = Number(request.headers.get('content-length') || 0)
    if (declaredLength > MAX_BODY_BYTES) return new Response('Request body is too large', { status: 413 })
    const raw = await request.text()
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return new Response('Request body is too large', { status: 413 })
    }
    body = JSON.parse(raw)
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  const messages = (body as { messages?: unknown })?.messages
  if (!isValidMessages(messages)) {
    return new Response('Body must include a non-empty `messages` array', { status: 400 })
  }

  // docs-agent answers ONE question and keeps its own conversation memory by id.
  // Take the latest user turn as the question; thread the id the client echoes back.
  const question = [...messages].reverse().find(m => m.role === 'user')?.content?.trim()
  if (!question) {
    return new Response('No user message to answer', { status: 400 })
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return new Response(`Question is too long (max ${MAX_QUESTION_LENGTH} characters).`, { status: 400 })
  }

  const rawCid = (body as { conversation_id?: unknown })?.conversation_id
  const conversationId = typeof rawCid === 'string' && rawCid.length > 0 && rawCid.length <= 128 ? rawCid : null

  let upstream: Response
  try {
    upstream = await callDocsAgent(question, conversationId)
  } catch {
    console.error('[ask-ai] docs-agent unreachable')
    return new Response('Ask AI is unavailable right now.', { status: 502 })
  }

  if (!upstream.ok || !upstream.body) {
    console.error('[ask-ai] docs-agent responded', upstream.status)
    return new Response('Ask AI is unavailable right now.', { status: 502 })
  }

  const frames = readFrames(upstream.body)

  // Read up to the `start` frame first, so the conversation id can ride back on a
  // response header (the client stores it and sends it with the next question).
  let newConversationId: string | null = null
  try {
    for (;;) {
      const { value: frame, done } = await frames.next()
      if (done) break
      if (frame.event === 'start') {
        try {
          newConversationId = JSON.parse(frame.data)?.conversation_id ?? null
        } catch {
          /* ignore a malformed start payload — threading is best-effort */
        }
        break
      }
      if (frame.event === 'error') {
        return new Response('Ask AI is unavailable right now.', { status: 502 })
      }
    }
  } catch {
    return new Response('Ask AI is unavailable right now.', { status: 502 })
  }

  const encoder = new TextEncoder()
  const responseBody = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for (;;) {
          const { value: frame, done } = await frames.next()
          if (done) break
          if (frame.event === 'token') {
            let text = ''
            try {
              text = JSON.parse(frame.data)?.text ?? ''
            } catch {
              text = ''
            }
            if (text) controller.enqueue(encoder.encode(text))
          } else if (frame.event === 'done') {
            break
          } else if (frame.event === 'error') {
            controller.error(new Error('stream error'))
            return
          }
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })

  const headers: Record<string, string> = {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    // Tell nginx not to buffer this response, so tokens reach the browser as they
    // arrive (the site's `location /` proxy leaves buffering on by default).
    'X-Accel-Buffering': 'no'
  }
  if (newConversationId) headers['X-Conversation-Id'] = newConversationId

  return new Response(responseBody, { headers })
}
