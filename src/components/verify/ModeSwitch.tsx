import { cn } from "@/lib/utils";
import { Globe, Server, KeyRound, Check } from "lucide-react";

export type VerifyMode = "hosted" | "standalone" | "managed";

const OPTIONS: {
  id: VerifyMode;
  label: string;
  tagline: string;
  blurb: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "managed",
    label: "Account · Managed by Valyd",
    tagline: "Login with Valyd · proofs only",
    blurb:
      "The user signs in with Valyd and verifies once — the result is stored on their account and reused everywhere. Returning users re-verify with a selfie only. You receive proofs (never raw KYC). Available hosted and as Core APIs.",
    icon: <KeyRound className="h-5 w-5" />,
  },
  {
    id: "hosted",
    label: "Non-account · Hosted",
    tagline: "Fresh · we host the UI",
    blurb:
      "No account. Create a session, redirect the user to a Valyd-hosted page, get the result by webhook + decision API. Nothing retained; you receive the raw result.",
    icon: <Globe className="h-5 w-5" />,
  },
  {
    id: "standalone",
    label: "Non-account · Core APIs",
    tagline: "Fresh · you build the UI",
    blurb:
      "No account. Call each capability directly (ID, liveness, face match, age, credential, location) and get a synchronous JSON result. Nothing retained; you receive the raw result.",
    icon: <Server className="h-5 w-5" />,
  },
];

/** One selectable option card. Shared by the two rows below. */
const OptionCard = ({
  opt,
  selected,
  onSelect,
}: {
  opt: (typeof OPTIONS)[number];
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onSelect}
    className={cn(
      "flex h-full flex-col text-left rounded-xl border p-5 transition-smooth",
      selected
        ? "border-primary bg-primary/5 shadow-soft ring-1 ring-primary/30"
        : "border-border hover:border-primary/40 hover:bg-accent",
    )}
  >
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        {opt.icon}
      </span>
      <span className="text-[15px] font-semibold text-foreground leading-tight">{opt.label}</span>
      {selected && (
        <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3 w-3" />
        </span>
      )}
    </div>
    <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {opt.tagline}
    </p>
    <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">{opt.blurb}</p>
  </button>
);

/**
 * Integration selector. Laid out as a hierarchy rather than three equal columns:
 * the first choice is Account vs Non-account, so the Account (Managed) card leads
 * full-width, and the two Non-account options sit together on the row below. This
 * declutters the long labels and reads as the decision the developer is actually
 * making.
 */
export const ModeSwitch = ({
  mode,
  onModeChange,
}: {
  mode: VerifyMode;
  onModeChange: (m: VerifyMode) => void;
}) => {
  const managed = OPTIONS.find((o) => o.id === "managed")!;
  const nonAccount = OPTIONS.filter((o) => o.id !== "managed");

  return (
    <div className="space-y-4">
      {/* Choice 1 — does the user have a Valyd account? */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          If your user signs in with Valyd
        </p>
        <OptionCard
          opt={managed}
          selected={mode === "managed"}
          onSelect={() => onModeChange("managed")}
        />
      </div>

      {/* Choice 2 — one-shot check, hosted UI or your own */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          For a one-shot check (no account)
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {nonAccount.map((opt) => (
            <OptionCard
              key={opt.id}
              opt={opt}
              selected={mode === opt.id}
              onSelect={() => onModeChange(opt.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Compact selector for the sidebar / sticky bars. Stacked vertically (one option
 * per row) so the labels stay readable in the narrow sidebar — the mode is the
 * primary choice, so all options stay visible rather than hidden in a dropdown.
 */
export const ModeSwitchCompact = ({
  mode,
  onModeChange,
}: {
  mode: VerifyMode;
  onModeChange: (m: VerifyMode) => void;
}) => (
  <div className="flex flex-col gap-1 rounded-lg border border-border p-1 bg-muted/40">
    {OPTIONS.map((opt) => {
      const selected = mode === opt.id;
      return (
        <button
          key={opt.id}
          type="button"
          aria-pressed={selected}
          onClick={() => onModeChange(opt.id)}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-medium transition-smooth",
            selected
              ? "bg-background text-primary shadow-soft"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          <span className={cn("shrink-0", selected ? "text-primary" : "text-muted-foreground")}>
            {opt.icon}
          </span>
          <span className="min-w-0 flex-1 truncate">{opt.label}</span>
          {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
        </button>
      );
    })}
  </div>
);
