export function page(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)} — Valyd SDK Starter</title>
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <div class="app">
    <header class="topbar">
      <a class="brand" href="/">
        <span class="logo">V</span>
        <span>Valyd SDK Starter</span>
      </a>
      <a class="docs-link" href="https://docs.valyd.work" target="_blank" rel="noopener">Docs ↗</a>
    </header>
    <main class="content">${body}</main>
    <footer class="foot">
      Built with <code>@valyd/sdk</code> &nbsp;·&nbsp;
      <a href="https://www.npmjs.com/package/@valyd/sdk" target="_blank" rel="noopener">npm</a>
    </footer>
  </div>
</body>
</html>`;
}

export function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function jsonBlock(obj: unknown): string {
  return `<pre class="json"><code>${escapeHtml(JSON.stringify(obj, null, 2))}</code></pre>`;
}
