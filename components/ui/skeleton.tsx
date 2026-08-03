import { cn } from './cn'

/** Theme-aware shimmer placeholder; size it to match the loading content. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('vd-skeleton', className)} />
}
