import { Sparkles } from "lucide-react";

export function Nav() {
  return (
    <header className="fixed top-0 z-50 w-full">
      <div className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-full glass-strong px-5 py-2.5 md:px-6">
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-brand shadow-glow">
            <Sparkles className="h-4 w-4 text-brand-foreground" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">FlipScout</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </nav>
        <a
          href="#cta"
          className="inline-flex items-center rounded-full bg-gradient-brand px-4 py-2 text-sm font-medium text-brand-foreground shadow-glow transition-transform hover:scale-[1.03]"
        >
          Join waitlist
        </a>
      </div>
    </header>
  );
}
