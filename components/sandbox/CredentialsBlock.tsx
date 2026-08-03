'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { SANDBOX_BASE_URL, SANDBOX_CLIENT_ID, SANDBOX_CLIENT_SECRET } from './constants'

const rows: { label: string; value: string }[] = [
  { label: 'client_id', value: SANDBOX_CLIENT_ID },
  { label: 'client_secret', value: SANDBOX_CLIENT_SECRET },
  { label: 'base URL', value: SANDBOX_BASE_URL }
]

export const CredentialsBlock = () => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const copy = async (val: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(val)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 1500)
    } catch {
      /* no-op */
    }
  }

  return (
    <div className="space-y-1.5 rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm dark:border-gray-800 dark:bg-slate-900">
      {rows.map((r, i) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="w-32 shrink-0 text-gray-500 dark:text-gray-400">{r.label}:</span>
          <span className="flex-1 break-all text-gray-900 dark:text-gray-100">{r.value}</span>
          <button
            onClick={() => copy(r.value, i)}
            className="shrink-0 rounded-md border border-transparent p-1.5 transition-colors hover:border-gray-200 hover:bg-white dark:hover:border-gray-700 dark:hover:bg-slate-800"
            title={`Copy ${r.label}`}
            aria-label={`Copy ${r.label}`}
          >
            {copiedIdx === i ? (
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        </div>
      ))}
    </div>
  )
}
