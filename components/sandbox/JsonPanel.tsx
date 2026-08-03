'use client'

import { cn } from './cn'
import { Skeleton } from '../ui/skeleton'

interface JsonPanelProps {
  data: unknown
  ok?: boolean
  status?: number
  label?: string
  placeholder?: string
  loading?: boolean
}

/**
 * Skeleton shimmer shown while a request is in flight. Sized to match the
 * rendered panel (header bar + body) so the swap causes no layout shift.
 */
const JsonSkeleton = ({ label }: { label?: string }) => (
  <div
    className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
    aria-busy="true"
    aria-live="polite"
  >
    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-1.5 dark:border-gray-800 dark:bg-slate-900">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label ?? 'Response'}
      </span>
      <Skeleton className="h-4 w-10 rounded" />
    </div>
    <div className="space-y-2 bg-white p-3 dark:bg-slate-950">
      {['w-full', 'w-[83%]', 'w-[91%]', 'w-[66%]', 'w-[75%]', 'w-[50%]'].map((w, i) => (
        <Skeleton key={i} className={cn('h-3 rounded', w)} />
      ))}
    </div>
  </div>
)

export const JsonPanel = ({ data, ok, status, label, placeholder, loading }: JsonPanelProps) => {
  if (loading) return <JsonSkeleton label={label} />

  if (data === null || data === undefined) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500 dark:border-gray-800 dark:bg-slate-900 dark:text-gray-400">
        {placeholder ?? 'Response will appear here.'}
      </div>
    )
  }

  const borderClass = ok
    ? 'border-green-300 bg-green-50/40 dark:border-green-900 dark:bg-green-950/30'
    : 'border-red-300 bg-red-50/40 dark:border-red-900 dark:bg-red-950/30'

  return (
    // `vd-rise` (global, prefers-reduced-motion gated) fades the fresh result in
    <div className={cn('vd-rise overflow-hidden rounded-lg border', borderClass)}>
      <div className="flex items-center justify-between border-b border-inherit bg-white/60 px-3 py-1.5 dark:bg-slate-950/60">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label ?? 'Response'}
        </span>
        {typeof status === 'number' && (
          <span
            className={cn(
              'rounded px-2 py-0.5 font-mono text-xs',
              ok
                ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
            )}
          >
            {status === 0 ? 'ERR' : status}
          </span>
        )}
      </div>
      <pre className="max-h-96 overflow-x-auto p-3 text-xs text-gray-900 dark:text-gray-100">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  )
}
