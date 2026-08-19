import HeroSection from "@/app/components/pages/home/HeroSection";
import TopLocations from "@/app/components/pages/home/TopLocations";
import JourneySection from "@/app/components/pages/home/JourneySection";

const page = () => {
   return (
      <div>
         <HeroSection />
         <TopLocations />
         <JourneySection />
      </div>
   );
};

export default page;
