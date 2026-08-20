import HeroSection from "@/app/components/pages/home/HeroSection";
import TopLocations from "@/app/components/pages/home/TopLocations";
import JourneySection from "@/app/components/pages/home/JourneySection";
import TopPicksSection from "@/app/components/pages/home/TopPicksSection";

const page = () => {
   return (
      <div>
         <HeroSection />
         <TopLocations />
         <JourneySection />
         <TopPicksSection />
      </div>
   );
};

export default page;
