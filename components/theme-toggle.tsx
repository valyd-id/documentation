'use client'

import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

const emptySubscribe = () => () => {}
/** false during SSR/hydration, true after mount — without setState-in-effect. */
const useMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false)

/**
 * One-button theme toggle: moon in light mode, sun in dark mode, direct
 * toggle on click (no dropdown). Default stays "system" until the user
 * clicks; the choice is persisted by next-themes. The icon renders only
 * after mount so server and client markup always match (no hydration
 * mismatch, no wrong-icon flash).
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useMounted()

  const isDark = resolvedTheme === 'dark'
  const label = mounted ? (isDark ? 'Switch to light mode' : 'Switch to dark mode') : 'Toggle theme'

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="vd-theme-toggle"
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-[18px] w-[18px]" aria-hidden />
        ) : (
          <Moon className="h-[18px] w-[18px]" aria-hidden />
        )
      ) : (
        <span className="block h-[18px] w-[18px]" aria-hidden />
      )}
    </button>
  )
}
