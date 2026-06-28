import { Activity, Bell, Calculator, Sparkles } from "lucide-react";

const stats = [
  { icon: Activity, label: "Listings analyzed daily", value: "120K+" },
  { icon: Sparkles, label: "AI-powered deal scoring", value: "Real-time" },
  { icon: Calculator, label: "Instant profit calculations", value: "< 200ms" },
  { icon: Bell, label: "Real-time alerts", value: "24/7" },
];

export function Stats() {
  return (
    <section className="border-y border-white/5 bg-black/20 py-8">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg glass">
              <s.icon className="h-4 w-4 text-brand-glow" />
            </div>
            <div>
              <div className="font-display text-xl font-semibold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
