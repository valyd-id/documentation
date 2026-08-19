'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import type { Lang, Snippet } from './snippets'

const TABS: { id: Lang; label: string }[] = [
  { id: 'curl', label: 'curl' },
  { id: 'js', label: 'JavaScript' },
  { id: 'python', label: 'Python' }
]

/** Plain <pre> code block with a copy button (the old app used shiki-backed CodeBlock). */
const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* no-op */
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border border-(--vd-border)">
      <button
        type="button"
        onClick={onCopy}
        title="Copy snippet"
        aria-label="Copy snippet"
        className="absolute right-2 top-2 z-10 rounded-md border border-slate-700 bg-slate-800/90 p-1.5 text-slate-300 opacity-0 transition-opacity hover:text-white focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
      </button>
      <pre className="max-h-80 overflow-x-auto bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  )
}

interface Props {
  snippet: Snippet
}

export const SnippetTabs = ({ snippet }: Props) => {
  return (
    <Tabs defaultValue="curl" className="w-full">
      <TabsList>
        {TABS.map(t => (
          <TabsTrigger key={t.id} value={t.id}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map(t => (
        <TabsContent key={t.id} value={t.id} className="mt-2">
          <CodeBlock code={snippet[t.id]} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
