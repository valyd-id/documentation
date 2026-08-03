import type { ReactNode } from 'react'
import { CircleCheck, CircleAlert, Info, TriangleAlert } from 'lucide-react'
import { cn } from './cn'

type Tone = 'info' | 'success' | 'warning' | 'error'

const tones: Record<Tone, { box: string; Icon: typeof Info }> = {
  info: {
    box: 'border-(--vd-primary-border) bg-(--vd-primary-soft) text-current',
    Icon: Info
  },
  success: {
    box: 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    Icon: CircleCheck
  },
  warning: {
    box: 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
    Icon: TriangleAlert
  },
  error: {
    box: 'border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200',
    Icon: CircleAlert
  }
}

export function Alert({
  tone = 'info',
  title,
  children,
  className
}: {
  tone?: Tone
  title?: string
  children: ReactNode
  className?: string
}) {
  const { box, Icon } = tones[tone]
  return (
    <div role="alert" className={cn('flex gap-3 rounded-(--vd-radius) border p-4 text-sm', box, className)}>
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
      <div className="min-w-0">
        {title ? <p className="m-0 mb-1 font-semibold">{title}</p> : null}
        <div className="[&>p]:m-0">{children}</div>
      </div>
    </div>
  )
}
