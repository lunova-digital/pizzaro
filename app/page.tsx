import Hero from "@/components/home/Hero";
import HomeOffers from "@/components/home/HomeOffers";
import FeaturedCombos from "@/components/home/FeaturedCombos";
import VideoSection from "@/components/home/VideoSection";
import FeaturedPizzas from "@/components/home/FeaturedPizzas";
import HowItWorks from "@/components/home/HowItWorks";
import DeliveryBanner from "@/components/home/DeliveryBanner";
import Testimonials from "@/components/home/Testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <HomeOffers />
      <FeaturedCombos />
      <FeaturedPizzas />
      <VideoSection />
      <HowItWorks />
      <DeliveryBanner />
      <Testimonials />
    </>
  );
}
