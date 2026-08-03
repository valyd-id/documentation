import OpenAI from 'openai'
import { getDocsContext } from './docs-context'

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

// Any OpenRouter model id (e.g. "openai/gpt-4o-mini", "google/gemini-2.0-flash-001")
// works here — override via OPENROUTER_MODEL to try a different one without a code change.
const DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet'

function getClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set — add it to your environment to use Ask AI.')
  }
  // OpenRouter is OpenAI-API-compatible, so the `openai` SDK works unmodified
  // by pointing baseURL at OpenRouter instead of OpenAI.
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    defaultHeaders: {
      'HTTP-Referer': 'https://docs-nextra.valyd.work',
      // Header values must be Latin-1 — no em dash here.
      'X-Title': 'Valyd Docs - Ask AI'
    }
  })
}

function buildSystemPrompt(): string {
  return `You are "Ask AI", an assistant embedded in Valyd's developer documentation site to help visitors navigate the docs.

Rules:
- Answer only using the documentation context provided below. Do not use outside knowledge about Valyd or make up endpoints, fields, or behavior that isn't in the context.
- When your answer draws on a specific page, cite it with a Markdown link to its path, e.g. [Quick start](/docs/quick-start).
- If the documentation context doesn't cover the question, say so plainly rather than guessing.
- Keep answers concise and developer-focused.

Adapt to how well-scoped the question is:
- Simple, well-scoped questions (a specific fact, endpoint, field, error code, "what is X") — answer directly, no back-and-forth.
- Broad or multi-part use cases where key details are missing (e.g. describing an integration scenario without saying which platform, which verification types, or whether users already have accounts) — ask 1-2 short, concrete clarifying questions first instead of guessing and writing a long speculative answer.
- Once you have enough detail (from this message or the conversation so far) to give a real, complete answer to a use case that needed clarification, briefly restate your understanding in a sentence or two and confirm it's correct before diving into the full detailed answer.
Use judgment — most questions don't need either step.

=== DOCUMENTATION CONTEXT ===
${getDocsContext()}
=== END DOCUMENTATION CONTEXT ===`
}

export async function streamAskAiResponse({ messages }: { messages: ChatMessage[] }) {
  const client = getClient()
  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL

  return client.chat.completions.create({
    model,
    stream: true,
    messages: [{ role: 'system', content: buildSystemPrompt() }, ...messages]
  })
}
