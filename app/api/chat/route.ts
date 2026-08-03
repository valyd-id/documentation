import type { NextRequest } from 'next/server'
import { streamAskAiResponse, type ChatMessage } from '@/lib/chat/complete'

// Needs Node (not edge) for the openai SDK and the filesystem-backed docs context.
export const runtime = 'nodejs'

const MAX_MESSAGES = 20
// Only caps what a user types, to bound cost/abuse. Assistant messages are
// our own generated answers (can legitimately be long, detailed docs
// answers) and aren't subject to this — capping them broke sending a long
// answer back as history on the next follow-up message.
const MAX_USER_MESSAGE_LENGTH = 4000

// This is a public, unauthenticated endpoint calling a paid LLM API. Skipped
// for now per product decision, but wire real rate limiting (e.g. a per-IP
// token bucket keyed on `x-forwarded-for`) in here before this goes to prod.
function checkRateLimit(): void {}

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
        (message.role !== 'user' || message.content.length <= MAX_USER_MESSAGE_LENGTH)
    )
  )
}

export async function POST(request: NextRequest) {
  checkRateLimit()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  const messages = (body as { messages?: unknown })?.messages
  if (!isValidMessages(messages)) {
    console.error('[ask-ai] rejected invalid messages payload', JSON.stringify(messages))
    return new Response('Body must include a non-empty `messages` array', { status: 400 })
  }

  let completionStream: Awaited<ReturnType<typeof streamAskAiResponse>>
  try {
    completionStream = await streamAskAiResponse({ messages })
  } catch (error) {
    console.error('[ask-ai] upstream request failed', error)
    const message = error instanceof Error ? error.message : 'Ask AI is unavailable right now.'
    return new Response(message, { status: 502 })
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
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}
