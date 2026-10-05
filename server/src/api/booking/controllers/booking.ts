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
            guestsCount,
            totalPrice,
            paymentMethodId,
            paymentSchedule,
            hostMessage,
         } = body.data;

         try {
            // 1. Stripe Payment
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

            // 2. Persist directly in Strapi v5
            const entry = await strapi
               .documents("api::booking.booking")
               .create({
                  data: {
                     checkIn,
                     checkOut,
                     guestsCount: Number(guestsCount || 1),
                     totalPrice: Number(totalPrice),
                     status: "confirmed", // Valid lowercase enum value
                     property: property ? (property as any) : undefined,
                     user: user?.documentId || user?.id || undefined,
                  },
                  status: "published",
               });

            return { data: entry };
         } catch (err: unknown) {
            console.error("Booking creation error:", err);
            const errorMessage =
               err instanceof Error ? err.message : "Booking creation failed";
            return ctx.badRequest(errorMessage);
         }
      },
   }),
);
