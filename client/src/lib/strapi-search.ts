import qs from "qs";

export interface SearchFilterParams {
   destination?: string;
   checkIn?: string;
   checkOut?: string;
   guests?: string | number;
   minPrice?: string | number;
   maxPrice?: string | number;
   selfCheckIn?: boolean;
   instantBook?: boolean;
   hasWasher?: boolean;
   hasHotTub?: boolean;
   page?: string | number;
   pageSize?: number;
   locale?: string; // <--- Add locale support here
}

type FilterCondition = Record<string, unknown>;

export function buildPropertyQuery(params: SearchFilterParams): string {
   const andArray: FilterCondition[] = [];
   const baseFilters: FilterCondition = {};

   // 1. Destination Filter
   // inside buildPropertyQuery in strapi-search.ts
   if (params.destination && params.destination.trim() !== "") {
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

   // 2. Guests Filter
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

   // 4. Feature Toggles
   if (params.selfCheckIn) {
      baseFilters.selfCheckIn = { $eq: true };
   }

   const filters: FilterCondition = { ...baseFilters };
   if (andArray.length > 0) {
      filters.$and = andArray;
   }

   // Root query object
   const queryPayload: Record<string, unknown> = {
      populate: "images",
      pagination: {
         page: params.page ? Math.max(1, Number(params.page)) : 1,
         pageSize: params.pageSize ? Number(params.pageSize) : 12,
      },
      sort: ["createdAt:desc"],
   };

   // Add locale to query if provided (e.g., 'en', 'es', 'fr', or 'all')
   if (params.locale) {
      queryPayload.locale = params.locale;
   }

   if (Object.keys(filters).length > 0) {
      queryPayload.filters = filters;
   }

   if (params.checkIn) queryPayload.checkIn = params.checkIn;
   if (params.checkOut) queryPayload.checkOut = params.checkOut;

   return qs.stringify(queryPayload, { encodeValuesOnly: true });
}
