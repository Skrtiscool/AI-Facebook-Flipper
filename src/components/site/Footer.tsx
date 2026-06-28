import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-brand">
            <Sparkles className="h-3 w-3 text-brand-foreground" />
          </div>
          <span className="font-display text-sm font-semibold">FlipScout</span>
        </div>
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} FlipScout. AI-powered marketplace intelligence.
        </div>
      </div>
    </footer>
  );
}
