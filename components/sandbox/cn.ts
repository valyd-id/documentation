/** Tiny className joiner (the old app used shadcn's `cn`; this is dependency-free). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
