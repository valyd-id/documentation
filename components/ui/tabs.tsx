'use client'

import type { ReactNode } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from './cn'

export const Tabs = TabsPrimitive.Root

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border border-(--vd-border) bg-(--vd-surface) p-1',
        className
      )}
    >
      {children}
    </TabsPrimitive.List>
  )
}

export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        'rounded-md px-3 py-1 text-xs font-medium text-slate-500 transition-colors dark:text-slate-400',
        'hover:text-slate-900 dark:hover:text-slate-100',
        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--vd-primary)',
        'data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm',
        'dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white'
      )}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
}

export function TabsContent({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  return (
    <TabsPrimitive.Content value={value} className={className}>
      {children}
    </TabsPrimitive.Content>
  )
}
