import { ArrowRight, PlayCircle, Tag, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-10 md:pt-36 md:pb-16">
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
      <div className="absolute inset-x-0 top-0 h-[600px] bg-[var(--gradient-radial)]" />

      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs text-muted-foreground"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
          </span>
          AI deal scanner now in private beta
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mx-auto mt-6 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl"
        >
          Find profitable flips <br className="hidden md:block" />
          <span className="text-gradient">before anyone else.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          FlipScout uses AI to scan marketplaces, detect undervalued items, predict resale value,
          and calculate profit in real time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a
            href="#cta"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-medium text-brand-foreground shadow-glow transition-transform hover:scale-[1.03]"
          >
            Join the Waitlist
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#how"
            className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-medium text-foreground hover:bg-white/5"
          >
            <PlayCircle className="h-4 w-4" />
            See how it works
          </a>
        </motion.div>

        {/* Floating UI mock */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="relative mx-auto mt-12 max-w-5xl"
        >
          <div className="relative rounded-3xl glass-strong p-3 shadow-card">
            <div className="rounded-2xl bg-[var(--surface)] p-6 md:p-10">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FloatCard
                  icon={<Tag className="h-4 w-4" />}
                  source="Facebook Marketplace"
                  title="Sony WH-1000XM4"
                  price="$95"
                  value="$240"
                  score={92}
                  delay={0}
                />
                <FloatCard
                  icon={<TrendingUp className="h-4 w-4" />}
                  source="OfferUp"
                  title="Milwaukee M18 Drill"
                  price="$120"
                  value="$365"
                  score={96}
                  highlighted
                  delay={0.15}
                />
                <FloatCard
                  icon={<Zap className="h-4 w-4" />}
                  source="Craigslist"
                  title="Peloton Bike+"
                  price="$700"
                  value="$1,420"
                  score={88}
                  delay={0.3}
                />
              </div>

              {/* AI scan line */}
              <div className="pointer-events-none absolute inset-x-6 top-6 bottom-6 overflow-hidden rounded-2xl">
                <div className="animate-scan h-px w-full bg-gradient-to-r from-transparent via-brand-glow to-transparent shadow-[0_0_24px_4px_var(--brand-glow)]" />
              </div>
            </div>
          </div>

          {/* Glow */}
          <div className="absolute -inset-x-20 -bottom-10 -z-10 h-40 bg-gradient-brand opacity-30 blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}

function FloatCard({
  icon, source, title, price, value, score, highlighted, delay = 0,
}: {
  icon: React.ReactNode; source: string; title: string; price: string; value: string;
  score: number; highlighted?: boolean; delay?: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
      className={`rounded-xl border p-4 text-left ${
        highlighted
          ? "border-brand/40 bg-brand/5 shadow-glow"
          : "border-white/5 bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">{icon}{source}</span>
        <span className="font-mono text-[10px]">{score}/100</span>
      </div>
      <div className="mt-3 font-display text-sm font-semibold">{title}</div>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Listed</div>
          <div className="font-mono text-base">{price}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Value</div>
          <div className="font-mono text-base text-success">{value}</div>
        </div>
      </div>
    </motion.div>
  );
}
