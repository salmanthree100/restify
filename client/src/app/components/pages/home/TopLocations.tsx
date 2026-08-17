// src/components/sections/TopLocations.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import qs from "qs";

interface LocationItem {
   id: number;
   title: string;
   country: string;
   propertyCount: number;
   image?: { url: string };
}
// Add this interface near your other TypeScript types at the top
interface StrapiLocationResponse {
   id: number;
   title: string;
   country: string;
   propertyCount: number;
   image?: {
      url: string;
   };
}

// Heights array for creating the wave/staggered visual effect
const CARD_HEIGHTS = [280, 340, 400, 340, 280];

export default function TopLocations() {
   const [locations, setLocations] = useState<LocationItem[]>([]);
   const [loading, setLoading] = useState(true);
   const { locale } = useLocale();

   const query = qs.stringify(
      {
         locale,
         populate: "image",
         filters: {
            isFeatured: {
               $eq: true,
            },
         },
         sort: ["order:asc"],
         pagination: {
            limit: 5,
         },
      },
      {
         encodeValuesOnly: true,
      },
   );

   useEffect(() => {
      const fetchLocations = async () => {
         try {
            const res = await fetch(`/api/strapi/locations?${query}`);
            const data = await res.json();

            if (Array.isArray(data?.data)) {
               // ✅ FIX: Replace `item: any` with `item: StrapiLocationResponse`
               setLocations(
                  data.data.map((item: StrapiLocationResponse) => ({
                     id: item.id,
                     title: item.title,
                     country: item.country,
                     propertyCount: item.propertyCount,
                     image: item.image,
                  })),
               );
            }
         } catch (err) {
            console.error("Failed to load locations:", err);
         } finally {
            setLoading(false);
         }
      };

      fetchLocations();
   }, [query]);

   if (loading)
      return <div className="text-center py-5">Loading top locations...</div>;

   return (
      <section className="container py-5">
         <h2 className="fw-bold mb-4 text-dark fs-2">Top Locations</h2>

         {/* Grid container aligning items to center vertically */}
         <div className="d-flex align-items-center justify-content-between gap-3 pb-3">
            {locations.map((loc, index) => {
               const imageUrl = loc.image?.url
                  ? getStrapiMedia(loc.image.url)
                  : "/placeholder.jpg";
               const cardHeight = CARD_HEIGHTS[index % CARD_HEIGHTS.length];

               return (
                  <div
                     key={loc.id}
                     className="position-relative overflow-hidden flex-shrink-0 cursor-pointer rounded-5 shadow-sm group"
                     style={{
                        width: "220px",
                        height: `${cardHeight}px`,
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                     }}
                  >
                     {/* Background Location Image */}
                     <Image
                        src={imageUrl!}
                        alt={loc.title}
                        fill
                        sizes="220px"
                        className="object-fit-cover"
                     />

                     {/* Gradient overlay for clear text visibility */}
                     <div
                        className="position-absolute inset-0"
                        style={{
                           background:
                              "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)",
                        }}
                     />

                     {/* Bottom Info Overlay */}
                     <div className="position-absolute bottom-0 start-0 p-3 text-white z-2">
                        <h3 className="fw-bold fs-4 mb-0 lh-1">{loc.title}</h3>
                        <div className="extra-small opacity-75 mt-1">
                           {loc.country}
                        </div>
                        <div className="small fw-semibold mt-2">
                           {loc.propertyCount.toLocaleString()} Properties
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>
      </section>
   );
}
