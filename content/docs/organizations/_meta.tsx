import type { MetaRecord } from 'nextra'
import { BookOpen, Shield, UserPlus, Code, CreditCard } from 'lucide-react'
import { MetaTitle } from '@/components/meta-title'

// Left-sidebar sub-menu for "Organizations & teams" (the parent group title +
// icon live in ../_meta.tsx). Order: Overview → Roles → Members → API → Billing.
export default {
  index: { title: <MetaTitle icon={BookOpen}>Overview</MetaTitle> },
  roles: { title: <MetaTitle icon={Shield}>Roles &amp; access</MetaTitle> },
  members: { title: <MetaTitle icon={UserPlus}>Members &amp; onboarding</MetaTitle> },
  api: { title: <MetaTitle icon={Code}>Organization API</MetaTitle> },
  billing: { title: <MetaTitle icon={CreditCard}>Pricing &amp; billing</MetaTitle> }
} satisfies MetaRecord
