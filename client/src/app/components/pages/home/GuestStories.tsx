"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import qs from "qs";
import { Container, Spinner } from "react-bootstrap";

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
            console.log(result?.data?.guestStoriesSection);
            setSectionData(result?.data?.guestStoriesSection || null);
         } catch (error) {
            console.error("Error fetching trendingLocations section:", error);
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

   return <div></div>;
};

export default GuestStories;
