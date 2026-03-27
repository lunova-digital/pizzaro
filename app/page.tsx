import Hero from "@/components/home/Hero";
import FeaturedPizzas from "@/components/home/FeaturedPizzas";
import HowItWorks from "@/components/home/HowItWorks";
import DeliveryBanner from "@/components/home/DeliveryBanner";
import Testimonials from "@/components/home/Testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedPizzas />
      <HowItWorks />
      <DeliveryBanner />
      <Testimonials />
    </>
  );
}
