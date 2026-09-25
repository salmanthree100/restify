"use client";

import { useState, useEffect } from "react";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import { use } from "react";
import { Property } from "@/app/types";
import HeroSlider from "@/app/components/pages/properties/properties-details/HeroSlider";

const PropertiesDetailsPage = ({
   params,
}: {
   params: Promise<{ slug: string }>;
}) => {
   const { slug } = use(params);
   const { locale } = useLocale();
   const [propertiesDetails, setPropertiesDetails] = useState<Property | null>(
      null,
   );
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      async function fetchProperties() {
         setIsLoading(true);

         // 1. Build the query object
         const propertyDetailsQuery = qs.stringify(
            {
               locale: locale,
               filters: {
                  documentId: {
                     $eq: slug,
                  },
               },
               populate: {
                  // Single and multiple media fields
                  images: {
                     populate: "*",
                  },

                  // Components
                  propertyPolicies: {
                     populate: "*",
                  },
                  categorizedPhotos: {
                     populate: {
                        images: {
                           populate: "*",
                        },
                     },
                  },
                  reviewsSection: {
                     populate: "*",
                  },

                  // Relations
                  amenities: {
                     populate: "*",
                  },
                  host: {
                     populate: {
                        avatar: {
                           populate: "*",
                        },
                     },
                  },
                  reviews: {
                     populate: {
                        reviewerAvatar: {
                           populate: "*", // Populates review author details if applicable
                        },
                     },
                  },
                  bookings: {
                     fields: ["checkIn", "checkOut"], // Fetch only date ranges for datepicker availability
                  },
               },
            },
            {
               encodeValuesOnly: true, // Output clean, readable query strings
            },
         );

         const baseUrl =
            process.env.NEXT_PUBLIC_STRAPI_CLOUD_URL ||
            process.env.NEXT_PUBLIC_STRAPI_LOCAL_URL ||
            "http://localhost:1337";

         try {
            const res = await fetch(
               `${baseUrl}/api/properties?${propertyDetailsQuery}`,
            );
            const json = await res.json();
            console.log(json?.data?.[0]);
            setPropertiesDetails(json?.data?.[0] || []);
         } catch (error) {
            console.error("Error loading properties details data:", error);
         } finally {
            setIsLoading(false);
         }
      }

      fetchProperties();
   }, [slug, locale]);

   return (
      <div>
         {!isLoading && (
            <HeroSlider
               categorizedPhotos={propertiesDetails?.categorizedPhotos || []}
            />
         )}
      </div>
   );
};

export default PropertiesDetailsPage;
