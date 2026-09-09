import qs from "qs";
import { getBoundingBox } from "./geo-utils";

export interface SearchFilterParams {
   destination?: string;
   lat?: string | number;
   lng?: string | number;
   radius?: number;
   checkIn?: string;
   checkOut?: string;
   guests?: string | number;
   minPrice?: string | number;
   maxPrice?: string | number;

   // Modal Filters
   instantBook?: boolean | string;
   selfCheckIn?: boolean | string;
   hasWasher?: boolean | string;
   hasHotTub?: boolean | string;
   propertyType?: string; // 'entire_home' | 'room' | 'any'

   page?: string | number;
   pageSize?: number;
   locale?: string;
}

type FilterCondition = Record<string, unknown>;

export function buildPropertyQuery(params: SearchFilterParams): string {
   const andArray: FilterCondition[] = [];
   const baseFilters: FilterCondition = {};

   // 1. Location / Map Coordinates Filter
   if (
      params.lat &&
      params.lng &&
      !isNaN(Number(params.lat)) &&
      !isNaN(Number(params.lng))
   ) {
      const latNum = Number(params.lat);
      const lngNum = Number(params.lng);
      const radius = params.radius || 25;

      const bbox = getBoundingBox(latNum, lngNum, radius);

      andArray.push(
         { latitude: { $between: [bbox.minLat, bbox.maxLat] } },
         { longitude: { $between: [bbox.minLng, bbox.maxLng] } },
      );
   } else if (params.destination && params.destination.trim() !== "") {
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

   // 2. Guest Count Filter
   if (
      params.guests &&
      !isNaN(Number(params.guests)) &&
      Number(params.guests) > 0
   ) {
      baseFilters.maxGuests = { $gte: Number(params.guests) };
   }

   // 3. Price Range Filter
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

   // 4. Modal Amenity Toggles (Boolean filters)
   // 1. Amenity Booleans - Only append filter if explicitly true
   if (params.instantBook === true || params.instantBook === "true") {
      baseFilters.instantBook = { $eq: true };
   }
   if (params.selfCheckIn === true || params.selfCheckIn === "true") {
      baseFilters.selfCheckIn = { $eq: true };
   }
   if (params.hasWasher === true || params.hasWasher === "true") {
      baseFilters.hasWasher = { $eq: true };
   }
   if (params.hasHotTub === true || params.hasHotTub === "true") {
      baseFilters.hasHotTub = { $eq: true };
   }

   // 2. Property Type - Only filter if selected and not "any"
   if (params.propertyType && params.propertyType !== "any") {
      baseFilters.propertyType = { $eq: params.propertyType };
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
