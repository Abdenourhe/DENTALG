import PublicHeader from "./_components/PublicHeader";
import PublicFooter from "./_components/PublicFooter";
import AnimatedHero from "./_components/AnimatedHero";
import TrustBar from "./_components/TrustBar";
import AnimatedFeatures from "./_components/AnimatedFeatures";
import HowItWorks from "./_components/HowItWorks";
import TestimonialsSection from "./_components/TestimonialsSection";
import LandingJobOffers from "./_components/LandingJobOffers";
import LandingListings from "./_components/LandingListings";
import PricingSection from "./_components/PricingSection";
import FAQSection from "./_components/FAQSection";
import AnimatedCTA from "./_components/AnimatedCTA";
import { getPublicStats } from "@/lib/actions/public-stats";
import { listPublicPlans } from "@/lib/actions/plans";

export default async function HomePage() {
  const [stats, plans] = await Promise.all([
    getPublicStats(),
    listPublicPlans(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader active="home" />
      <AnimatedHero stats={stats} />
      <TrustBar />
      <AnimatedFeatures />
      <HowItWorks />
      <TestimonialsSection />
      <LandingJobOffers />
      <LandingListings />
      <PricingSection plans={plans} />
      <FAQSection />
      <AnimatedCTA />
      <PublicFooter />
    </div>
  );
}
