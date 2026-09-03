import { factories } from "@strapi/strapi";

export default factories.createCoreController(
   "api::property.property",
   ({ strapi }) => ({
      async find(ctx) {
         // 1. Extract non-standard query keys so core Strapi find won't reject them
         const { checkIn, checkOut, destination, ...sanitizedQuery } =
            ctx.query;

         let unavailablePropertyIds: (string | number)[] = [];

         // 2. Safely find overlapping bookings if dates are present
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

               unavailablePropertyIds = overlappingBookings
                  .map((booking: any) => booking.property?.id)
                  .filter(Boolean);
            } catch (err) {
               console.warn("Booking availability check skipped:", err);
            }
         }

         // 3. Merge filters
         const existingFilters =
            (sanitizedQuery.filters as Record<string, any>) || {};

         if (unavailablePropertyIds.length > 0) {
            sanitizedQuery.filters = {
               ...existingFilters,
               id: { $notIn: unavailablePropertyIds },
            };
         } else {
            sanitizedQuery.filters = existingFilters;
         }

         // 4. Overwrite ctx.query with cleaned query object
         ctx.query = sanitizedQuery;

         return await super.find(ctx);
      },
   }),
);
