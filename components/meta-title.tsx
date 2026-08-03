import type { LucideIcon } from 'lucide-react'
import type { ReactElement } from 'react'

/** Sidebar label with a consistently sized, aligned icon (used from _meta.tsx files). */
export function MetaTitle({ icon: Icon, children }: { icon: LucideIcon; children: string }): ReactElement {
  return (
    <span className="vd-meta-title">
      <Icon aria-hidden />
      {children}
    </span>
  )
}
