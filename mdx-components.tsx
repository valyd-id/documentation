import type { MDXComponents } from 'nextra/mdx-components'
import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { Tabs } from 'nextra/components'

const docsComponents = getDocsMDXComponents()

// Global components — available in every .md/.mdx page without an import.
// `Tabs` powers the language switcher (storageKey="valyd-lang" syncs + persists
// the selection across every code block and page).
export const useMDXComponents = (components?: MDXComponents) => ({
  ...docsComponents,
  Tabs,
  ...components
})
