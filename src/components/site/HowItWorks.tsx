import { MapPin, Radar, Brain, LineChart, BellRing } from "lucide-react";

const steps = [
  { icon: MapPin, title: "Set your scope", body: "Choose your location and the categories you flip." },
  { icon: Radar, title: "Auto-scan", body: "FlipScout monitors marketplaces around the clock." },
  { icon: Brain, title: "AI analysis", body: "We parse listings, images, and prices in seconds." },
  { icon: LineChart, title: "Profit math", body: "Resale value and profit are calculated instantly." },
  { icon: BellRing, title: "Get alerted", body: "Be first when a high-profit deal appears." },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-16">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader eyebrow="How it works" title="From listing to profit in under a minute." />

        <div className="mt-10 grid gap-4 md:grid-cols-5">
          {steps.map((s, i) => (
            <div key={s.title} className="group relative rounded-2xl glass p-5 transition-all hover:bg-white/[0.04]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand text-brand-foreground shadow-glow">
                  <s.icon className="h-4 w-4" />
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">0{i + 1}</span>
              </div>
              <div className="font-display text-base font-semibold">{s.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="inline-flex items-center rounded-full glass px-3 py-1 text-xs uppercase tracking-wider text-brand-glow">
        {eyebrow}
      </div>
      <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-muted-foreground">{sub}</p>}
    </div>
  );
}
