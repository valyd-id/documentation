import { Sparkles } from "lucide-react";

const entries = [
  {
    version: "v1.5.1",
    date: "Unified SDK + Workforce Members API",
    items: [
      { tag: "Added", text: "Workforce Members API on ValydClient — addMembers() (single or bulk ≤ 500, notify flag), getMembers() (roster with status + valyd_id), getBilling() (seats, price, trial, balance, invoices)." },
      { tag: "Added", text: "One unified package @valyd/sdk: valyd.auth (Login with Valyd) + valyd.verify (verification) + workforce members — one credential, one host." },
      { tag: "Docs", text: "Organizations page lists every member operation; install is now `npm install @valyd/sdk` (latest)." },
    ],
  },
  {
    version: "v0.2.0",
    date: "Login sessions for TPSSO",
    items: [
      { tag: "Added", text: "createLoginSession() and verifyLoginSession() helpers." },
      { tag: "Docs", text: "Clarified that the callback state is Valyd's session id, not your authorize state." },
      { tag: "Breaking (docs)", text: "Removed the state-equality CSRF pattern — use verifyLoginSession instead." },
    ],
  },
  {
    version: "v0.1.0",
    date: "Initial release",
    items: [
      { tag: "Added", text: "ValydClient with getAuthorizationUrl, parseCallback, exchangeCode, refreshToken." },
      { tag: "Added", text: "Resource helpers: getUserInfo, getLicenses, getCprLicense, getDoctorLicense, getVerifications." },
    ],
  },
];

const tagColor = (tag: string) => {
  if (tag.startsWith("Breaking")) return "bg-red-100 text-red-700";
  if (tag === "Added") return "bg-emerald-100 text-emerald-700";
  return "bg-blue-100 text-blue-700";
};

export const ChangelogSection = () => {
  return (
    <section id="changelog" className="scroll-mt-8">
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-primary" /> Changelog
      </h2>

      <div className="space-y-6">
        {entries.map((e) => (
          <div key={e.version} className="p-6 rounded-lg border border-border bg-card">
            <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-border">
              <code className="text-lg font-bold text-primary">{e.version}</code>
              <span className="text-sm text-muted-foreground">— {e.date}</span>
            </div>
            <ul className="space-y-2">
              {e.items.map((i, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded mt-0.5 whitespace-nowrap ${tagColor(i.tag)}`}>
                    {i.tag}
                  </span>
                  <span className="text-sm text-foreground">{i.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};
