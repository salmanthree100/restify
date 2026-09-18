"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { buildPropertyQuery } from "@/lib/strapi-search";
import { PropertyGrid } from "@/app/components/pages/properties/PropertyGrid";
import { useLocale } from "@/context/LocaleContext";

export interface PaginationMeta {
   page: number;
   pageSize: number;
   pageCount: number;
   total: number;
}

export default function PropertiesPage() {
   const searchParams = useSearchParams();
   const { locale } = useLocale();
   const [properties, setProperties] = useState([]);
   const [pagination, setPagination] = useState<PaginationMeta | null>(null);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      async function fetchProperties() {
         setIsLoading(true);

         const queryString = buildPropertyQuery({
            destination: searchParams.get("destination") || undefined,
            lat: searchParams.get("lat") || undefined,
            lng: searchParams.get("lng") || undefined,
            guests: searchParams.get("guests") || undefined,
            minPrice: searchParams.get("minPrice") || undefined,
            maxPrice: searchParams.get("maxPrice") || undefined,
            instantBook: searchParams.get("instantBook") || undefined,
            selfCheckIn: searchParams.get("selfCheckIn") || undefined,
            hasWasher: searchParams.get("hasWasher") || undefined,
            hasHotTub: searchParams.get("hasHotTub") || undefined,
            propertyType: searchParams.get("propertyType") || undefined,
            page: searchParams.get("page") || "1",
            locale: locale,
         });

         const baseUrl =
            process.env.NEXT_PUBLIC_STRAPI_CLOUD_URL ||
            process.env.NEXT_PUBLIC_STRAPI_LOCAL_URL ||
            "http://localhost:1337";

         try {
            const res = await fetch(`${baseUrl}/api/properties?${queryString}`);
            const json = await res.json();

            setProperties(json.data || []);
            setPagination(json.meta?.pagination || null);
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
            <PropertyGrid properties={properties} pagination={pagination} />
         )}
      </div>
   );
}
