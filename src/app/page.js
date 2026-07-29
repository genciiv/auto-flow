import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import IndustryMarquee from "@/components/landing/IndustryMarquee";
import FeaturesSection from "@/components/landing/FeaturesSection";
import MarketplaceSection from "@/components/landing/MarketplaceSection";
import AiSection from "@/components/landing/AiSection";
import PricingSection from "@/components/landing/PricingSection";
import FaqSection from "@/components/landing/FaqSection";
import Footer from "@/components/landing/Footer";
import AutoFlowNetwork from "@/components/landing/AutoFlowNetwork";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <Header />

      <HeroSection />

      <div id="industries" className="scroll-mt-24">
        <IndustryMarquee />
      </div>

      <AutoFlowNetwork />
      <FeaturesSection />
      <MarketplaceSection />
      <AiSection />
      <PricingSection />
      <FaqSection />
      <Footer />
    </main>
  );
}
