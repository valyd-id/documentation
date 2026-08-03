'use client'

import type { ReactNode } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <TooltipPrimitive.Provider delayDuration={200}>{children}</TooltipPrimitive.Provider>
}

export function Tooltip({ content, children }: { content: ReactNode; children: ReactNode }) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={6}
          className="z-50 max-w-72 rounded-md border border-(--vd-border) bg-white px-3 py-1.5 text-xs text-slate-700 shadow-md dark:bg-slate-900 dark:text-slate-200"
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-white dark:fill-slate-900" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
