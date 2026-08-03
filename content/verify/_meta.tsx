import type { MetaRecord } from 'nextra'
import { BadgeCheck, ShieldCheck } from 'lucide-react'
import { MetaTitle } from '@/components/meta-title'

export default {
  'ship-hosted-kyc': { title: <MetaTitle icon={ShieldCheck}>Ship Hosted KYC</MetaTitle> },
  'verify-license': { title: <MetaTitle icon={BadgeCheck}>Verify a professional license</MetaTitle> }
} satisfies MetaRecord
