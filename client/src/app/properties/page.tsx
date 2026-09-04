"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { buildPropertyQuery } from "@/lib/strapi-search";
import { PropertyGrid } from "../components/pages/properties/PropertyGrid";
import { useLocale } from "@/context/LocaleContext";

export default function PropertiesPage() {
   const searchParams = useSearchParams();
   const { locale } = useLocale(); // e.g., 'en', 'fr', 'es'
   const [properties, setProperties] = useState([]);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      async function fetchProperties() {
         setIsLoading(true);

         // Build query string with current locale
         const queryString = buildPropertyQuery({
            destination: searchParams.get("destination") || undefined,
            guests: searchParams.get("guests") || undefined,
            minPrice: searchParams.get("minPrice") || undefined,
            maxPrice: searchParams.get("maxPrice") || undefined,
            page: searchParams.get("page") || undefined,
            locale: locale, // <--- Pass locale here
         });

         const baseUrl =
            process.env.NEXT_PUBLIC_STRAPI_CLOUD_URL ||
            process.env.NEXT_PUBLIC_STRAPI_LOCAL_URL ||
            "http://localhost:1337";

         try {
            const res = await fetch(`${baseUrl}/api/properties?${queryString}`);
            const json = await res.json();
            console.log(json.data);
            setProperties(json.data || []);
         } catch (error) {
            console.error("Error loading properties:", error);
         } finally {
            setIsLoading(false);
         }
      }

      fetchProperties();
   }, [searchParams, locale]);

   return (
      <div>
         {isLoading ? (
            <div className="text-center py-5">Loading...</div>
         ) : (
            <PropertyGrid properties={properties} />
         )}
      </div>
   );
}
