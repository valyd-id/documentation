import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '@/mdx-components'
import { substituteHosts } from '@/lib/host-substitute'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

type PageProps = {
  params: Promise<{ mdxPath?: string[] }>
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath)
  return metadata
}

const Wrapper = getMDXComponents().wrapper!

export default async function Page(props: PageProps) {
  const params = await props.params
  const { default: MDXContent, toc, metadata, sourceCode } = await importPage(params.mdxPath)
  // Swap canonical *.valyd.work hosts in the RAW source to this env's hosts HERE,
  // so React encodes the Flight length prefix correctly. Doing it as a postbuild
  // byte-replace over the .rsc/.html corrupts that prefix → "Connection closed".
  const source = typeof sourceCode === 'string' ? substituteHosts(sourceCode) : sourceCode
  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={source}>
      <MDXContent params={params} />
    </Wrapper>
  )
}
