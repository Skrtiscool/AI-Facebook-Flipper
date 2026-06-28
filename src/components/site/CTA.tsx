import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function CTA() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section id="cta" className="relative py-16">
      <div className="mx-auto max-w-4xl px-6">
        <div className="relative overflow-hidden rounded-3xl glass-strong p-8 text-center md:p-12">
          <div className="absolute inset-0 -z-10 opacity-60 [background:var(--gradient-mesh)]" />
          <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
            Start finding <span className="text-gradient">better deals</span> today.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join the waitlist for early access. Limited beta seats — first invites going out weekly.
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); if (email) setDone(true); }}
            className="mx-auto mt-8 flex max-w-md flex-col items-stretch gap-2 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-brand/60"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-medium text-brand-foreground shadow-glow transition-transform hover:scale-[1.03]"
            >
              {done ? (<><CheckCircle2 className="h-4 w-4" /> You're on the list</>) : (<>Join the Waitlist <ArrowRight className="h-4 w-4" /></>)}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
