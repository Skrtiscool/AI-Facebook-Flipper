import {
  ScanSearch, Radar, Calculator, LineChart, BellRing, EyeOff,
  MessageSquare, Bookmark, Globe2,
} from "lucide-react";
import { SectionHeader } from "./HowItWorks";

const features = [
  { icon: ScanSearch, title: "AI product recognition", body: "Identify items from blurry photos and partial descriptions." },
  { icon: Radar, title: "Marketplace deal scanner", body: "Continuous monitoring of every new listing in your area." },
  { icon: Calculator, title: "Profit calculator", body: "Fees, shipping, and effort baked into every number." },
  { icon: LineChart, title: "Resale value prediction", body: "ML models trained on millions of historical sales." },
  { icon: BellRing, title: "Instant alerts", body: "Push, email, and SMS the moment a deal goes live." },
  { icon: EyeOff, title: "Hidden deal detection", body: "Surface mispriced and mistitled listings competitors miss." },
  { icon: MessageSquare, title: "AI negotiation assistant", body: "Drafts the perfect offer message in your voice." },
  { icon: Bookmark, title: "Saved searches", body: "Track categories, brands, and price thresholds forever." },
  { icon: Globe2, title: "Multi-marketplace", body: "Facebook, Craigslist, OfferUp, eBay — all in one feed." },
];

export function Features() {
  return (
    <section id="features" className="relative py-16">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader eyebrow="Features" title="Every edge a serious flipper needs." />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl glass p-6 transition-all hover:-translate-y-0.5 hover:bg-white/[0.04]"
            >
              <div className="absolute inset-0 -z-10 bg-gradient-brand opacity-0 transition-opacity duration-500 group-hover:opacity-[0.06]" />
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand-glow">
                <f.icon className="h-5 w-5" />
              </div>
              <div className="font-display text-lg font-semibold">{f.title}</div>
              <div className="mt-1.5 text-sm text-muted-foreground">{f.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
