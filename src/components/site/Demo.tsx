import { CheckCircle2, Sparkles, TrendingUp } from "lucide-react";
import { SectionHeader } from "./HowItWorks";

export function Demo() {
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="Live AI demo"
          title="A real deal, scored in real time."
          sub="This is what FlipScout shows you the moment a profitable listing hits the market."
        />

        <div className="mx-auto mt-10 max-w-3xl">
          <div className="relative rounded-3xl glass-strong p-2 shadow-card">
            <div className="rounded-[1.25rem] bg-[var(--surface)] p-7 md:p-9">
              {/* Top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
                  Scanned 2s ago · OfferUp · Austin, TX
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs text-success">
                  <Sparkles className="h-3 w-3" /> Hot deal
                </div>
              </div>

              <h3 className="mt-5 font-display text-2xl font-semibold md:text-3xl">
                Milwaukee M18 Fuel Drill Kit
              </h3>
              <p className="text-sm text-muted-foreground">
                Includes 2 batteries, charger, hard case — listed by private seller.
              </p>

              <div className="mt-7 grid grid-cols-3 gap-3">
                <Metric label="Listed price" value="$120" />
                <Metric label="Market value" value="$365" accent="text-foreground" />
                <Metric label="Est. profit" value="+$170" accent="text-success" />
              </div>

              {/* Score */}
              <div className="mt-7 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Deal score</span>
                  <span className="font-mono text-lg font-semibold">96<span className="text-muted-foreground">/100</span></span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full w-[96%] rounded-full bg-gradient-brand shadow-glow" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  <Chip><CheckCircle2 className="h-3 w-3 text-success" /> Verified image match</Chip>
                  <Chip><CheckCircle2 className="h-3 w-3 text-success" /> Below 33% of market</Chip>
                  <Chip><TrendingUp className="h-3 w-3 text-brand-glow" /> Resale demand: high</Chip>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <div className="text-sm">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Recommendation</div>
                  <div className="font-display text-xl font-semibold text-success">BUY NOW</div>
                </div>
                <button className="rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-medium text-brand-foreground shadow-glow">
                  Message seller
                </button>
              </div>
            </div>
          </div>
          <div className="absolute -inset-x-20 -z-10 mx-auto h-40 max-w-3xl bg-gradient-brand opacity-20 blur-3xl" />
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, accent = "text-foreground" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono text-2xl font-semibold ${accent}`}>{value}</div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1">{children}</span>;
}
