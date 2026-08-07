import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import WorkshopStorySection from "@/components/landing/WorkshopStorySection";
import CoreProductSection from "@/components/landing/CoreProductSection";
import PricingSection from "@/components/landing/PricingSection";
import FaqSection from "@/components/landing/FaqSection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <Header />
      <HeroSection />
      <WorkshopStorySection />
      <CoreProductSection />
      <PricingSection />
      <FaqSection />
      <Footer />
    </main>
  );
}
