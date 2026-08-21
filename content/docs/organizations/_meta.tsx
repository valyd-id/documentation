import type { MetaRecord } from 'nextra'
import { BookOpen, Shield, UserPlus, UserCog, Code } from 'lucide-react'
import { MetaTitle } from '@/components/meta-title'

// Left-sidebar sub-menu for the "Organizations" section (the parent group title +
// icon live in ../_meta.tsx). Order matches the IA manifest:
// Overview → Members → Roles → Workforce onboarding → API.
export default {
  index: { title: <MetaTitle icon={BookOpen}>Overview</MetaTitle> },
  members: { title: <MetaTitle icon={UserPlus}>Members</MetaTitle> },
  roles: { title: <MetaTitle icon={Shield}>Roles</MetaTitle> },
  onboarding: { title: <MetaTitle icon={UserCog}>Workforce onboarding</MetaTitle> },
  api: { title: <MetaTitle icon={Code}>API</MetaTitle> },

  // Not a manifest nav item — kept reachable by URL (linked from members/onboarding), hidden from nav.
  billing: { display: 'hidden' }
} satisfies MetaRecord
