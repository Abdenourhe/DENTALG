import PublicHeader from "./_components/PublicHeader";
import PublicFooter from "./_components/PublicFooter";
import AnimatedHero from "./_components/AnimatedHero";
import AnimatedFeatures from "./_components/AnimatedFeatures";
import LandingJobOffers from "./_components/LandingJobOffers";
import PricingSection from "./_components/PricingSection";
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
      <AnimatedFeatures />
      <LandingJobOffers />
      <PricingSection plans={plans} />
      <AnimatedCTA />
      <PublicFooter />
    </div>
  );
}
