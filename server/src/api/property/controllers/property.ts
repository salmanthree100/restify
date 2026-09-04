import { factories } from "@strapi/strapi";

export default factories.createCoreController(
   "api::property.property",
   ({ strapi }) => ({
      async find(ctx) {
         // 1. Strip custom query params so core Strapi find won't reject them
         const { checkIn, checkOut, destination, ...sanitizedQuery } =
            ctx.query;

         let unavailablePropertyIds: (string | number)[] = [];

         // 2. Safe check if bookings exist
         if (checkIn && checkOut) {
            try {
               const overlappingBookings = await strapi.db
                  .query("api::booking.booking")
                  .findMany({
                     select: ["id"],
                     where: {
                        $and: [
                           { checkIn: { $lt: String(checkOut) } },
                           { checkOut: { $gt: String(checkIn) } },
                        ],
                     },
                     populate: ["property"],
                  });

               if (overlappingBookings && overlappingBookings.length > 0) {
                  unavailablePropertyIds = overlappingBookings
                     .map((booking: any) => booking.property?.id)
                     .filter(Boolean);
               }
            } catch (err) {
               // If booking table is empty or error occurs, log and fall through safely
               console.warn("Booking availability check skipped:", err);
            }
         }

         // 3. Apply excluded property IDs if any were found
         if (unavailablePropertyIds.length > 0) {
            const existingFilters =
               (sanitizedQuery.filters as Record<string, any>) || {};
            sanitizedQuery.filters = {
               ...existingFilters,
               id: { $notIn: unavailablePropertyIds },
            };
         }

         // 4. Overwrite ctx.query with cleaned query
         ctx.query = sanitizedQuery;

         return await super.find(ctx);
      },
   }),
);
