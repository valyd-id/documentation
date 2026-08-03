import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'
import { cn } from './cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-(--vd-radius) font-semibold transition-all ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--vd-primary) ' +
  'disabled:cursor-not-allowed disabled:opacity-50 ' +
  'motion-safe:hover:-translate-y-px motion-safe:active:translate-y-0'

const variants: Record<Variant, string> = {
  primary:
    'bg-(--vd-primary) text-white shadow-sm hover:opacity-90 hover:shadow-md dark:text-slate-900',
  secondary:
    'border border-(--vd-border) text-current hover:border-(--vd-primary-border) hover:bg-(--vd-primary-soft)',
  ghost: 'text-current hover:bg-(--vd-primary-soft)',
  destructive: 'bg-red-600 text-white hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400'
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-sm'
}

type CommonProps = { variant?: Variant; size?: Size; className?: string; children: ReactNode }

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  href,
  children,
  ...props
}: CommonProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return (
    <Link href={href} className={cn(base, 'no-underline', variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  )
}
