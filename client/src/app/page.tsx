import HeroSection from "@/app/components/pages/home/HeroSection";
import TopLocations from "@/app/components/pages/home/TopLocations";
import JourneySection from "@/app/components/pages/home/JourneySection";
import TopPicksSection from "@/app/components/pages/home/TopPicksSection";
import TrendingLocations from "@/app/components/pages/home/TrendingLocations";
import GuestStories from "@/app/components/pages/home/GuestStories";
import ExploreWorld from "@/app/components/pages/home/ExploreWorld";
import ServicesOffer from "@/app/components/pages/home/ServicesOffer";

const page = () => {
   return (
      <div>
         <HeroSection />
         <TopLocations />
         <JourneySection />
         <TopPicksSection />
         <TrendingLocations />
         <GuestStories />
         <ExploreWorld />
         <ServicesOffer />
      </div>
   );
};

export default page;
