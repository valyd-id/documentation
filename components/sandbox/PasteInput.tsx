'use client'

import { useState } from 'react'
import { Check, ClipboardPaste, Copy } from 'lucide-react'

interface Props {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hint?: string
}

export const PasteInput = ({ label, value, onChange, placeholder, hint }: Props) => {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* no-op */
    }
  }

  const onPaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) onChange(text.trim())
    } catch {
      /* no-op */
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </label>
        {hint && <span className="text-[11px] text-gray-500 dark:text-gray-400">{hint}</span>}
      </div>
      <div className="flex items-stretch gap-1.5">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          className="min-w-0 flex-1 rounded-md border border-(--vd-border) bg-white px-3 py-2 font-mono text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--vd-primary-border) dark:bg-slate-950 dark:text-gray-100 dark:placeholder:text-gray-500"
        />
        <button
          type="button"
          onClick={onPaste}
          title="Paste from clipboard"
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-(--vd-border) bg-white px-2.5 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:bg-slate-950 dark:text-gray-400 dark:hover:bg-slate-900 dark:hover:text-gray-100"
        >
          <ClipboardPaste className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onCopy}
          disabled={!value}
          title="Copy"
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-(--vd-border) bg-white px-2.5 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 dark:bg-slate-950 dark:text-gray-400 dark:hover:bg-slate-900 dark:hover:text-gray-100"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  )
}
