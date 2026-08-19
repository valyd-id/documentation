import { page, escapeHtml } from "./layout.js";

export function errorPage(title: string, message: string, detail?: unknown): string {
  return page(
    title,
    `
    <div class="card">
      <div class="alert err">
        <strong>${escapeHtml(title)}</strong>
        <div style="margin-top:6px">${escapeHtml(message)}</div>
      </div>
      ${
        detail
          ? `<details open><summary>Details</summary><pre class="json"><code>${escapeHtml(
              typeof detail === "string" ? detail : JSON.stringify(detail, null, 2),
            )}</code></pre></details>`
          : ""
      }
      <div style="margin-top:18px"><a class="btn" href="/">← Start over</a></div>
    </div>
  `,
  );
}
