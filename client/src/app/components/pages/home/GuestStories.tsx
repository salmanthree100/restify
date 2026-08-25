"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";
import { getStrapiMedia } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import qs from "qs";
import { Container, Spinner } from "react-bootstrap";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface StoryImage {
   id: number;
   documentId: string;
   url: string;
   alternativeText: string | null;
   width: number;
   height: number;
}

interface MapImage {
   id: number;
   documentId: string;
   url: string;
   alternativeText: string | null;
   width: number;
   height: number;
}

interface GuestStory {
   id: number;
   documentId: string;
   name: string;
   country: string;
   age: number;
   ageText: string;
   quote: string;
   avatar: StoryImage | null;
   positionX: number;
   positionY: number;
}

interface SectionData {
   id: number;
   mainTitle: string;
   highlightTitle: string;
   buttonText: string;
   buttonLink: string;
   mapBackground: MapImage | null;
   stories: GuestStory[];
}

const GuestStories = () => {
   const { locale } = useLocale();
   const [sectionData, setSectionData] = useState<SectionData | null>(null);
   const [loading, setLoading] = useState<boolean>(true);
   const [activeIndex, setActiveIndex] = useState<number>(0);
   const [isMobile, setIsMobile] = useState<boolean>(false);
   const sliderRef = useRef<Slider | null>(null);

   useEffect(() => {
      const handleResize = () => {
         setIsMobile(window.innerWidth < 768);
      };

      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
   }, []);

   useEffect(() => {
      async function fetchLocationsData() {
         setLoading(true);

         const query = qs.stringify(
            {
               locale,
               populate: {
                  guestStoriesSection: {
                     populate: {
                        mapBackground: { populate: "*" },
                        stories: {
                           populate: {
                              avatar: { populate: "*" },
                           },
                        },
                     },
                  },
               },
            },
            { encodeValuesOnly: true },
         );

         try {
            const res = await fetch(`/api/strapi/home-page?${query}`);
            if (!res.ok) throw new Error("Failed to fetch data");

            const result = await res.json();
            const data = result?.data?.guestStoriesSection || null;
            setSectionData(data);
         } catch (error) {
            console.error("Error fetching guestStories section:", error);
         } finally {
            setLoading(false);
         }
      }

      fetchLocationsData();
   }, [locale]);

   if (loading) {
      return (
         <section className="py-5 bg-white text-center">
            <Spinner animation="border" variant="danger" />
         </section>
      );
   }

   if (!sectionData || !sectionData.stories?.length) return null;

   const mapBgUrl = sectionData.mapBackground
      ? getStrapiMedia(sectionData.mapBackground.url)
      : null;

   const slickSettings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      autoplay: true,
      autoplaySpeed: 4000,
      beforeChange: (_current: number, next: number) => setActiveIndex(next),
      customPaging: (i: number) => (
         <div
            className={`rounded-pill transition-all ${
               i === activeIndex ? "guest-active-dots" : "guest-inactive-dots"
            }`}
            style={{
               height: "8px",
               width: i === activeIndex ? "32px" : "8px",
               transition: "all 0.3s ease",
               cursor: "pointer",
            }}
         />
      ),
      dotsClass:
         "slick-dots d-flex justify-content-center align-items-center gap-2 pb-3 position-relative",
   };

   return (
      <section className="guest-stories-section py-4 py-md-5 bg-white overflow-hidden">
         <Container>
            {/* Section Header */}
            <div className="text-center mb-3 mb-md-4">
               <h2 className="fw-bold fs-1 m-0 text-dark">
                  {sectionData.mainTitle}{" "}
                  <span className="primary-text">
                     {sectionData.highlightTitle}
                  </span>
               </h2>
            </div>

            {/* Map View & Pinned Cards */}
            <div
               className="position-relative w-100 mx-auto"
               style={{
                  minHeight: isMobile ? "320px" : "520px",
               }}
            >
               {mapBgUrl && (
                  <Image
                     src={mapBgUrl}
                     alt={
                        sectionData.mapBackground?.alternativeText ||
                        "Map Background"
                     }
                     fill
                     className="object-fit-cover opacity-75"
                     priority
                  />
               )}

               {/* Render Pin Cards */}
               {sectionData.stories.map((story, index) => {
                  const avatarUrl = story.avatar
                     ? getStrapiMedia(story.avatar.url)
                     : null;
                  const isActive = activeIndex === index;

                  // Responsive offset scaling so pins stay mapped accurately on smaller maps
                  const posX = isMobile
                     ? story.positionX * 0.45
                     : story.positionX;
                  const posY = isMobile
                     ? story.positionY * 0.45
                     : story.positionY;

                  // Scale down active card on mobile screens
                  const scaleFactor = isActive
                     ? isMobile
                        ? 1.45
                        : 2.1
                     : isMobile
                       ? 0.75
                       : 1;

                  return (
                     <div
                        key={story.id}
                        className="position-absolute"
                        style={{
                           top: `calc(25% + ${posY}px)`,
                           left: `calc(45% + ${posX}px)`,
                           transform: `translate(-50%, -50%) scale(${scaleFactor})`,
                           transformOrigin: "center center",
                           zIndex: isActive ? 20 : 2,
                           cursor: "pointer",
                           transition:
                              "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                        onClick={() => {
                           setActiveIndex(index);
                           sliderRef.current?.slickGoTo(index);
                        }}
                     >
                        <div
                           className={`rounded-3 rounded-md-4 overflow-hidden position-relative ${
                              isActive
                                 ? "shadow-lg border border-1 border-white"
                                 : "shadow-sm"
                           }`}
                           style={{
                              width: isMobile ? "65px" : "90px",
                              height: isMobile ? "80px" : "110px",
                              filter: isActive
                                 ? "grayscale(0%)"
                                 : "grayscale(100%)",
                              transition: "filter 0.3s ease",
                           }}
                        >
                           {avatarUrl ? (
                              <Image
                                 src={avatarUrl}
                                 alt={story.name}
                                 fill
                                 className="object-fit-cover"
                              />
                           ) : (
                              <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center text-white fw-bold">
                                 {story.name.charAt(0)}
                              </div>
                           )}

                           {/* Text Overlay for Active Card */}
                           {isActive && (
                              <div
                                 className="position-absolute bottom-0 start-0 w-100 p-1 p-md-2 text-white"
                                 style={{
                                    background:
                                       "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)",
                                 }}
                              >
                                 <h6
                                    className="fw-bold mb-0 text-white"
                                    style={{
                                       fontSize: isMobile
                                          ? "0.42rem"
                                          : "0.55rem",
                                    }}
                                 >
                                    {story.name}
                                 </h6>
                                 <small
                                    className="opacity-75 d-block"
                                    style={{
                                       fontSize: isMobile
                                          ? "0.32rem"
                                          : "0.4rem",
                                       lineHeight: "1",
                                    }}
                                 >
                                    {story.country} • {story.age}{" "}
                                    {story.ageText}
                                 </small>
                              </div>
                           )}
                        </div>
                     </div>
                  );
               })}
            </div>

            {/* Dynamic Quote Slider */}
            <div className="mx-auto text-center" style={{ maxWidth: "550px" }}>
               <Slider ref={sliderRef} {...slickSettings}>
                  {sectionData.stories.map((story) => (
                     <div key={story.id} className="px-2 px-md-3">
                        <p className="fw-semibold text-secondary fs-6 fs-md-5 lh-sm m-0">
                           {story.quote}
                        </p>
                     </div>
                  ))}
               </Slider>

               {/* Action Link Button */}
               {sectionData.buttonText && sectionData.buttonLink && (
                  <div className="mt-3 mt-md-4">
                     <Link
                        href={sectionData.buttonLink}
                        className="btn btn-dark rounded-4 px-4 py-2 fw-medium shadow-sm fs-6"
                     >
                        {sectionData.buttonText}
                     </Link>
                  </div>
               )}
            </div>
         </Container>
      </section>
   );
};

export default GuestStories;
