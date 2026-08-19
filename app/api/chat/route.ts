import type { NextRequest } from 'next/server'
import { streamAskAiResponse, type ChatMessage } from '@/lib/chat/complete'

// Needs Node (not edge) for the openai SDK and the filesystem-backed docs context.
export const runtime = 'nodejs'

const MAX_MESSAGES = 20
const MAX_USER_MESSAGE_LENGTH = 4000
const MAX_ASSISTANT_MESSAGE_LENGTH = 8000
const MAX_BODY_BYTES = 64 * 1024
const MAX_HISTORY_LENGTH = 32_000

// This is a public, unauthenticated endpoint calling a paid LLM API. Guard it
// with a per-IP token bucket so a single client can't rack up model spend.
// In-memory (per server process) — fine for a single PM2 instance; move to
// Redis if this ever runs multi-instance. Tunable via env.
const RATE_MAX = Math.min(100, Math.max(1, Number(process.env.CHAT_RATE_MAX) || 20))
const RATE_WINDOW_MS = Math.min(3_600_000, Math.max(1_000, Number(process.env.CHAT_RATE_WINDOW_MS) || 60_000))
const buckets = new Map<string, { count: number; reset: number }>()

function clientIp(request: NextRequest): string {
  // The reverse proxy must overwrite this header. Never trust the left-most
  // X-Forwarded-For value supplied by an internet client.
  return (request.headers.get('x-real-ip') || 'unknown').slice(0, 64)
}

// Returns true when the request is allowed, false when the IP is over its limit.
function checkRateLimit(request: NextRequest): boolean {
  const ip = clientIp(request)
  const now = Date.now()
  const b = buckets.get(ip)
  if (!b || now > b.reset) {
    buckets.set(ip, { count: 1, reset: now + RATE_WINDOW_MS })
    // Opportunistic sweep so the map can't grow unbounded.
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

  let completionStream: Awaited<ReturnType<typeof streamAskAiResponse>>
  try {
    completionStream = await streamAskAiResponse({ messages })
  } catch {
    console.error('[ask-ai] upstream request failed')
    return new Response('Ask AI is unavailable right now.', { status: 502 })
  }

  const encoder = new TextEncoder()
  const responseBody = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of completionStream) {
          const delta = chunk.choices[0]?.delta?.content
          if (delta) controller.enqueue(encoder.encode(delta))
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })

  return new Response(responseBody, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  })
}
