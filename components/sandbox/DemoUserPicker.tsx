'use client'

import { cn } from './cn'
import { DEMO_USERS, type DemoUser } from './constants'

interface Props {
  value: DemoUser
  onChange: (v: DemoUser) => void
}

export const DemoUserPicker = ({ value, onChange }: Props) => {
  return (
    <div className="rounded-lg border border-(--vd-border) bg-white p-4 dark:bg-slate-950">
      <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Demo User</h3>
      <div className="space-y-2">
        {DEMO_USERS.map(u => (
          <label
            key={u.id}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-md border p-2 transition-colors',
              value === u.id
                ? 'border-(--vd-primary) bg-(--vd-primary-soft)'
                : 'border-transparent hover:bg-gray-100 dark:hover:bg-slate-900'
            )}
          >
            <input
              type="radio"
              name="demo-user"
              checked={value === u.id}
              onChange={() => onChange(u.id)}
              className="h-4 w-4 accent-(--vd-primary)"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{u.label}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">— {u.desc}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
