// lib/strapi-search.ts
import qs from "qs";
import { getBoundingBox } from "./geo-utils";

export interface SearchFilterParams {
   destination?: string;
   lat?: string | number;
   lng?: string | number;
   radius?: number; // Radius in kilometers (default 25km)
   checkIn?: string;
   checkOut?: string;
   guests?: string | number;
   minPrice?: string | number;
   maxPrice?: string | number;
   page?: string | number;
   pageSize?: number;
   locale?: string;
}

type FilterCondition = Record<string, unknown>;

export function buildPropertyQuery(params: SearchFilterParams): string {
   const andArray: FilterCondition[] = [];
   const baseFilters: FilterCondition = {};

   // 1. GEOGRAPHIC COORD FILTERING (Prioritized over address string)
   if (
      params.lat &&
      params.lng &&
      !isNaN(Number(params.lat)) &&
      !isNaN(Number(params.lng))
   ) {
      const latNum = Number(params.lat);
      const lngNum = Number(params.lng);
      const radius = params.radius || 25; // 25km radius

      const bbox = getBoundingBox(latNum, lngNum, radius);

      // Filter properties within the latitude/longitude boundary
      andArray.push(
         { latitude: { $between: [bbox.minLat, bbox.maxLat] } },
         { longitude: { $between: [bbox.minLng, bbox.maxLng] } },
      );
   }
   // Fallback to Address string matching if coordinates are not provided
   else if (params.destination && params.destination.trim() !== "") {
      const cleanDestination = params.destination.split(",")[0].trim();
      if (cleanDestination) {
         andArray.push({
            $or: [
               { address: { $containsi: cleanDestination } },
               { title: { $containsi: cleanDestination } },
            ],
         });
      }
   }

   // 2. Guest Filter
   if (
      params.guests &&
      !isNaN(Number(params.guests)) &&
      Number(params.guests) > 0
   ) {
      baseFilters.maxGuests = { $gte: Number(params.guests) };
   }

   // 3. Price Filter
   if (params.minPrice || params.maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (params.minPrice && !isNaN(Number(params.minPrice))) {
         priceFilter.$gte = Number(params.minPrice);
      }
      if (params.maxPrice && !isNaN(Number(params.maxPrice))) {
         priceFilter.$lte = Number(params.maxPrice);
      }
      if (Object.keys(priceFilter).length > 0) {
         baseFilters.pricePerNight = priceFilter;
      }
   }

   const filters: FilterCondition = { ...baseFilters };
   if (andArray.length > 0) {
      filters.$and = andArray;
   }

   const queryPayload: Record<string, unknown> = {
      populate: "images",
      pagination: {
         page: params.page ? Math.max(1, Number(params.page)) : 1,
         pageSize: params.pageSize ? Number(params.pageSize) : 12,
      },
      sort: ["createdAt:desc"],
   };

   if (params.locale) {
      queryPayload.locale = params.locale;
   }

   if (Object.keys(filters).length > 0) {
      queryPayload.filters = filters;
   }

   return qs.stringify(queryPayload, { encodeValuesOnly: true });
}
