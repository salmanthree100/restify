import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   /* Experimental React Compiler */
   reactCompiler: true,

   images: {
      remotePatterns: [
         // 1. Local Strapi Uploads
         {
            protocol: "http",
            hostname: "localhost",
            port: "1337",
            pathname: "/uploads/**",
         },
         // 2. Production Strapi Cloud Uploads
         {
            protocol: "https",
            hostname: "**.media.strapiapp.com",
            pathname: "/uploads/**",
         },
      ],
      // Keep set to true during active development if you want to save image optimization bandwidth
      unoptimized: process.env.NODE_ENV === "development",
   },

   async rewrites() {
      const strapiUrl =
         process.env.NEXT_PUBLIC_STRAPI_CLOUD_URL ||
         process.env.NEXT_PUBLIC_STRAPI_LOCAL_URL ||
         "http://localhost:1337"; // Fallback to prevent returning empty rewrites during build steps

      const sanitizedUrl = strapiUrl.replace(/\/$/, "");

      return [
         /**
          * STRATEGY A: If you are NOT using NextAuth.js in Next.js, and want ALL /api/* requests
          * (including /api/auth/local for Strapi login/register) routed directly to Strapi:
          */
         {
            source: "/api/strapi/:path*",
            destination: `${sanitizedUrl}/api/:path*`,
         },

         /**
          * STRATEGY B: If you prefer keeping standard /api/:path* routing:
          * Use a precise path match instead of a broad negative lookahead regex.
          * E.g., proxy all Strapi API calls, but exclude specific Next.js API routes if needed.
          */
         /*
      {
        source: "/api/strapi-auth/:path*",
        destination: `${sanitizedUrl}/api/auth/:path*`,
      },
      */
      ];
   },
};

export default nextConfig;
