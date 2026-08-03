import fs from 'node:fs'
import path from 'node:path'

const CONTENT_DIR = path.join(process.cwd(), 'content')
const OPENAPI_FILES = ['public/openapi/valyd-id.json', 'public/openapi/valyd-verify.json']

function routeFromContentPath(filePath: string): string {
  const relative = path.relative(CONTENT_DIR, filePath).replace(/\\/g, '/')
  const withoutExt = relative.replace(/\.mdx?$/, '')
  const segments = withoutExt.split('/').filter(segment => segment !== 'index')
  return '/' + segments.join('/')
}

function collectContentFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return collectContentFiles(fullPath)
    return /\.mdx?$/.test(entry.name) ? [fullPath] : []
  })
}

// Built once per server process and reused across requests — content changes
// require a redeploy anyway, so there's no need to re-read the filesystem
// on every chat request.
let cachedContext: string | null = null

export function getDocsContext(): string {
  if (cachedContext) return cachedContext

  const docSections = collectContentFiles(CONTENT_DIR)
    .sort()
    .map(filePath => {
      const route = routeFromContentPath(filePath)
      const body = fs.readFileSync(filePath, 'utf-8').trim()
      return `=== FILE: ${route} ===\n${body}\n`
    })

  const openApiSections = OPENAPI_FILES.filter(relativePath =>
    fs.existsSync(path.join(process.cwd(), relativePath))
  ).map(relativePath => {
    const body = fs.readFileSync(path.join(process.cwd(), relativePath), 'utf-8').trim()
    return `=== FILE: /${relativePath.replace('public/', '')} (OpenAPI spec) ===\n${body}\n`
  })

  cachedContext = [...docSections, ...openApiSections].join('\n')
  return cachedContext
}
