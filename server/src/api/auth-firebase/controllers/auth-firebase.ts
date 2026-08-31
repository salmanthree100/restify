import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { Context } from "koa";

// Initialize Firebase Admin SDK (Modular Syntax)
if (!getApps().length) {
   initializeApp({
      credential: cert({
         projectId: process.env.FIREBASE_PROJECT_ID,
         clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
         privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
   });
}

export default {
   async authenticate(ctx: Context) {
      const { idToken } = ctx.request.body as { idToken?: string };

      if (!idToken) {
         return ctx.badRequest("Missing Firebase ID Token");
      }

      try {
         // 1. Verify token with Firebase Admin Auth
         const decodedToken = await getAuth().verifyIdToken(idToken);
         const phoneNumber = decodedToken.phone_number;

         if (!phoneNumber) {
            return ctx.badRequest("Phone number not associated with token");
         }

         // 2. Find or create user in Strapi
         const sanitizePhone = phoneNumber.replace(/[^0-9]/g, "");
         let user = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
               where: { phoneNumber },
            });

         if (!user) {
            const defaultRole = await strapi.db
               .query("plugin::users-permissions.role")
               .findOne({
                  where: { type: "authenticated" },
               });

            user = await strapi.db
               .query("plugin::users-permissions.user")
               .create({
                  data: {
                     username: `user_${sanitizePhone}`,
                     email: `${sanitizePhone}@mobile.auth`,
                     phoneNumber: phoneNumber,
                     confirmed: true,
                     blocked: false,
                     role: defaultRole.id,
                  },
               });
         }

         // 3. Issue Strapi JWT Token
         const jwt = strapi.plugin("users-permissions").service("jwt").issue({
            id: user.id,
         });

         return ctx.send({ jwt, user });
      } catch (error: any) {
         return ctx.badRequest(`Authentication failed: ${error.message}`);
      }
   },
};
