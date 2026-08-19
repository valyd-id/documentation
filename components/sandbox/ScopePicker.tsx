'use client'

import { cn } from './cn'
import { Tooltip } from '../ui/tooltip'
import { AVAILABLE_SCOPES, SCOPE_DESCRIPTIONS } from './constants'

interface Props {
  selected: Set<string>
  onChange: (next: Set<string>) => void
}

export const ScopePicker = ({ selected, onChange }: Props) => {
  const toggle = (scope: string) => {
    const next = new Set(selected)
    if (next.has(scope)) next.delete(scope)
    else next.add(scope)
    onChange(next)
  }

  return (
    <div className="rounded-lg border border-(--vd-border) bg-white p-4 dark:bg-slate-950">
      <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Scopes</h3>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_SCOPES.map(scope => {
          const checked = selected.has(scope)
          return (
            <Tooltip key={scope} content={SCOPE_DESCRIPTIONS[scope]}>
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-sm transition-colors',
                  checked
                    ? 'border-(--vd-primary) bg-(--vd-primary-soft) text-gray-900 dark:text-gray-100'
                    : 'border-(--vd-border) bg-white text-gray-500 hover:bg-gray-100 dark:bg-slate-950 dark:text-gray-400 dark:hover:bg-slate-900'
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(scope)}
                  className="h-3.5 w-3.5 accent-(--vd-primary)"
                />
                {scope}
              </label>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}
