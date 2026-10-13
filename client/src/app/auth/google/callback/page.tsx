"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function GoogleCallbackContent() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const { login } = useAuth();
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const handleGoogleAuth = async () => {
         const accessToken =
            searchParams.get("access_token") ||
            searchParams.get("raw[access_token]");
         const idToken =
            searchParams.get("id_token") || searchParams.get("raw[id_token]");

         if (!accessToken && !idToken) {
            setError("No authentication token found in URL.");
            return;
         }

         try {
            const STRAPI_URL =
               process.env.NEXT_PUBLIC_STRAPI_API_URL ||
               process.env.NEXT_PUBLIC_STRAPI_CLOUD_URL ||
               "http://localhost:1337";

            // Call Strapi's OAuth callback endpoint with the provider token
            const res = await fetch(
               `${STRAPI_URL}/api/auth/google/callback?access_token=${accessToken || idToken}`,
            );

            if (!res.ok) {
               throw new Error("Failed to authenticate with Strapi.");
            }

            const data = await res.json();
            // data contains: { jwt: "...", user: { ... } }

            if (data.jwt && data.user) {
               login(data.jwt, data.user); // This handles state update and router.push("/dashboard/trips")
            } else {
               throw new Error("Invalid response structure from backend.");
            }
         } catch (err) {
            console.error("Google Auth Callback Error:", err);
            setError("Authentication failed. Please try logging in again.");
         }
      };

      handleGoogleAuth();
   }, [searchParams, router, login]);

   if (error) {
      return (
         <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="alert alert-danger">{error}</div>
         </div>
      );
   }

   return (
      <div className="d-flex justify-content-center align-items-center vh-100">
         <div className="text-center">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3">Completing Google Sign-in...</p>
         </div>
      </div>
   );
}

export default function GoogleCallbackPage() {
   return (
      <Suspense
         fallback={
            <div className="d-flex justify-content-center align-items-center vh-100">
               <div className="spinner-border text-primary" role="status"></div>
            </div>
         }
      >
         <GoogleCallbackContent />
      </Suspense>
   );
}
