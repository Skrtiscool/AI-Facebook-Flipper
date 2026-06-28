import { Check } from "lucide-react";
import { SectionHeader } from "./HowItWorks";

const tiers = [
  {
    name: "Free", price: "$0", period: "forever",
    desc: "Try the scanner with limited alerts.",
    features: ["5 alerts per day", "Basic AI analysis", "1 saved search", "1 marketplace"],
    cta: "Get started",
  },
  {
    name: "Pro", price: "$19", period: "/month", featured: true,
    desc: "For serious flippers running daily.",
    features: ["Unlimited alerts", "Advanced AI analysis", "Unlimited saved searches", "All marketplaces", "Negotiation assistant"],
    cta: "Start Pro trial",
  },
  {
    name: "Elite", price: "$49", period: "/month",
    desc: "Priority everything, for power users.",
    features: ["Priority alerts (< 30s)", "Advanced analytics", "Early access features", "Dedicated support", "API access"],
    cta: "Go Elite",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-16">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader eyebrow="Pricing" title="Pay for the deals you'd never have found alone." />

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col rounded-3xl p-7 ${
                t.featured
                  ? "border border-brand/40 glass-strong shadow-glow"
                  : "glass"
              }`}
            >
              {t.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-3 py-1 text-[11px] font-medium text-brand-foreground">
                  Most popular
                </div>
              )}
              <div className="font-display text-lg font-semibold">{t.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">{t.desc}</div>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-semibold tracking-tight">{t.price}</span>
                <span className="text-sm text-muted-foreground">{t.period}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-glow" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#cta"
                className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-transform hover:scale-[1.02] ${
                  t.featured
                    ? "bg-gradient-brand text-brand-foreground shadow-glow"
                    : "glass hover:bg-white/5"
                }`}
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
