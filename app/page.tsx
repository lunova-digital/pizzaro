import DeliveryBanner from '@/components/home/DeliveryBanner';
import FeaturedCombos from '@/components/home/FeaturedCombos';
import FeaturedPizzas from '@/components/home/FeaturedPizzas';
import Hero from '@/components/home/Hero';
import HomeOffers from '@/components/home/HomeOffers';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import VideoSection from '@/components/home/VideoSection';

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
