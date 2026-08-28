export function page(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)} — Valyd SDK Starter</title>
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <div class="app">
    <header class="topbar">
      <a class="brand" href="/">
        <img class="logo-img" src="/valyd-logo.png" alt="Valyd" />
        <span class="brand-tag">SDK Starter</span>
      </a>
      <a class="docs-link" href="https://docs.valyd.work" target="_blank" rel="noopener">Docs ↗</a>
    </header>
    <main class="content">${body}</main>
    <footer class="foot">
      <nav class="foot-links">
        <a href="https://valyd.work" target="_blank" rel="noopener">Valyd</a>
        <a href="https://docs.valyd.work" target="_blank" rel="noopener">Docs</a>
        <a href="https://valyd.work/privacy" target="_blank" rel="noopener">Privacy</a>
        <a href="https://valyd.work/terms" target="_blank" rel="noopener">Terms</a>
        <a href="https://www.npmjs.com/package/@valyd/sdk" target="_blank" rel="noopener">npm</a>
      </nav>
      <div class="foot-note">Built with <code>@valyd/sdk</code></div>
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
