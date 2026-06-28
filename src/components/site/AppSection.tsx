import { Apple, Smartphone, Bell } from "lucide-react";

export function AppSection() {
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-3xl glass-strong p-7 md:p-12">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-brand opacity-30 blur-3xl" />
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-xs uppercase tracking-wider text-brand-glow">
                Mobile
              </div>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                The fastest alerts <span className="text-gradient">in your pocket.</span>
              </h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                Get push notifications the moment a high-profit deal appears — beat every other flipper to the message.
              </p>
              <p className="mt-6 text-sm font-medium text-muted-foreground">Coming soon on iOS and Android</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-full glass px-4 py-2.5 text-sm opacity-70">
                  <Apple className="h-4 w-4" /> App Store
                </button>
                <button disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-full glass px-4 py-2.5 text-sm opacity-70">
                  <Smartphone className="h-4 w-4" /> Google Play
                </button>
              </div>
            </div>

            {/* Phone mock */}
            <div className="relative mx-auto">
              <div className="relative h-[520px] w-[260px] rounded-[2.5rem] border border-white/10 bg-[var(--surface)] p-3 shadow-card">
                <div className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black/60" />
                <div className="h-full w-full overflow-hidden rounded-[2rem] bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--background)] p-4 pt-10">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Today</div>
                  <div className="mt-3 space-y-3">
                    {[
                      { t: "PS5 Disc Edition", p: "$280 → $520", s: 94 },
                      { t: "DeWalt 20V Combo", p: "$140 → $310", s: 91 },
                      { t: "Herman Miller Aeron", p: "$320 → $780", s: 97 },
                    ].map((n, i) => (
                      <div key={i} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <Bell className="h-3 w-3 text-brand-glow" /> Deal alert
                        </div>
                        <div className="mt-1 text-sm font-semibold">{n.t}</div>
                        <div className="mt-0.5 flex items-center justify-between font-mono text-xs">
                          <span className="text-muted-foreground">{n.p}</span>
                          <span className="text-success">{n.s}/100</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -inset-10 -z-10 bg-gradient-brand opacity-20 blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
