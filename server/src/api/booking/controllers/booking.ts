import { factories } from "@strapi/strapi";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
   apiVersion: "2026-09-30.endive",
});

export default factories.createCoreController(
   "api::booking.booking",
   ({ strapi }) => ({
      async create(ctx) {
         const user = ctx.state.user;
         const body = ctx.request.body;

         if (!body?.data) {
            return ctx.badRequest("Missing payload data");
         }

         const {
            property,
            checkIn,
            checkOut,
            guests,
            guestsCount,
            totalPrice,
            paymentMethodId,
         } = body.data;

         try {
            // 1. Process Stripe Payment synchronously
            const paymentIntent = await stripe.paymentIntents.create({
               amount: Math.round(Number(totalPrice) * 100),
               currency: "usd",
               payment_method: paymentMethodId,
               confirm: true,
               automatic_payment_methods: {
                  enabled: true,
                  allow_redirects: "never",
               },
            });

            if (paymentIntent.status !== "succeeded") {
               return ctx.badRequest("Payment processing failed");
            }

            const formattedCheckIn = checkIn
               ? new Date(checkIn).toISOString().split("T")[0]
               : new Date().toISOString().split("T")[0];

            const formattedCheckOut = checkOut
               ? new Date(checkOut).toISOString().split("T")[0]
               : new Date(Date.now() + 86400000).toISOString().split("T")[0];

            const propertyDocId =
               typeof property === "object"
                  ? property?.documentId || property?.id
                  : property;

            // 2. Persist using bookingStatus instead of reserved status
            const entry = await strapi
               .documents("api::booking.booking")
               .create({
                  data: {
                     checkIn: formattedCheckIn,
                     checkOut: formattedCheckOut,
                     guestsCount: Number(guestsCount || guests || 1),
                     totalPrice: Number(totalPrice),
                     bookingStatus: "confirmed", // Custom enum field
                     property: propertyDocId || undefined,
                     user: user?.documentId || user?.id || undefined,
                  },
                  status: "published", // Document publish state
               });

            return { data: entry };
         } catch (err: unknown) {
            console.error("Booking Creation Error:", err);
            const errorMessage =
               err instanceof Error ? err.message : "Booking creation failed";
            return ctx.badRequest(errorMessage);
         }
      },
   }),
);
