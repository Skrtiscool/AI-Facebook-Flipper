import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Stats } from "@/components/site/Stats";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Demo } from "@/components/site/Demo";
import { Features } from "@/components/site/Features";
import { AppSection } from "@/components/site/AppSection";
import { Pricing } from "@/components/site/Pricing";
import { Testimonials } from "@/components/site/Testimonials";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FlipScout — Find Profitable Flips Before Anyone Else" },
      { name: "description", content: "AI-powered marketplace flipping assistant. Scan Facebook Marketplace, Craigslist, OfferUp, and eBay for undervalued items with real-time profit calculations." },
      { property: "og:title", content: "FlipScout — AI Marketplace Flipping Assistant" },
      { property: "og:description", content: "AI scans marketplaces, predicts resale value, and alerts you the moment a profitable flip appears." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Nav />
      <Hero />
      <Stats />
      <HowItWorks />
      <Demo />
      <Features />
      <AppSection />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
