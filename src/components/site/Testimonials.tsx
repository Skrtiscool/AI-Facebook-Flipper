import { Star } from "lucide-react";
import { SectionHeader } from "./HowItWorks";

const items = [
  {
    quote: "I made $2,400 in my first month just flipping tools. FlipScout pinged me before any other reseller saw the listing.",
    name: "Marcus T.", role: "Side hustler · Dallas, TX",
  },
  {
    quote: "The AI catches mispriced items I'd never find scrolling manually. It's like having an analyst on every marketplace at once.",
    name: "Priya S.", role: "Full-time reseller · NYC",
  },
  {
    quote: "Quit my warehouse job in 4 months. The profit calc is scary accurate — within $10 every time.",
    name: "Jordan R.", role: "eBay Power Seller",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader eyebrow="Testimonials" title="Resellers who got there first." />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {items.map((t) => (
            <figure key={t.name} className="rounded-2xl glass p-7">
              <div className="flex gap-0.5 text-warning">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-lg leading-relaxed text-foreground/90">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand font-display text-sm font-semibold text-brand-foreground">
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
