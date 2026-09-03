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
}

export function buildPropertyQuery(params: SearchFilterParams) {
   const filters: Record<string, any> = {};

   // 1. Clean Destination (e.g., "Sydney, Australia" -> "Sydney")
   if (params.destination) {
      const cleanDestination = params.destination.split(",")[0].trim();
      if (cleanDestination) {
         filters.$or = [
            { locationName: { $containsi: cleanDestination } },
            { title: { $containsi: cleanDestination } },
            { address: { $containsi: cleanDestination } },
         ];
      }
   }

   // 2. Guests
   if (params.guests) {
      filters.maxGuests = { $gte: Number(params.guests) };
   }

   // 3. Price filtering
   if (params.minPrice || params.maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (params.minPrice) priceFilter.$gte = Number(params.minPrice);
      if (params.maxPrice) priceFilter.$lte = Number(params.maxPrice);
      filters.pricePerNight = priceFilter;
   }

   // 4. Amenities
   if (params.selfCheckIn) {
      filters.selfCheckIn = { $eq: true };
   }

   return qs.stringify(
      {
         // Pass checkIn & checkOut at root so Strapi controller interceptor reads them
         ...(params.checkIn ? { checkIn: params.checkIn } : {}),
         ...(params.checkOut ? { checkOut: params.checkOut } : {}),
         populate: "*",
         filters,
         pagination: {
            page: params.page ? Number(params.page) : 1,
            pageSize: params.pageSize ? Number(params.pageSize) : 12,
         },
         sort: ["createdAt:desc"],
      },
      { encodeValuesOnly: true },
   );
}
