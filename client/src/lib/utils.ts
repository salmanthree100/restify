/**
 * Formats a Strapi media URL, ensuring relative paths are prefixed
 * with either the local development backend or the Strapi Cloud media host.
 *
 * @param url - The relative or absolute media URL from Strapi (string, null, or undefined)
 * @returns The absolute media URL string, or null if no valid input is provided.
 */
export function getStrapiMedia(url?: string | null): string | null {
   if (!url) return null;

   // Return the full URL directly if it's already an absolute path (e.g., external CDN, S3, or Cloudinary)
   if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("//")
   ) {
      return url;
   }

   // Strapi Cloud assets live on the `.media.strapiapp.com` subdomain
   const cloudUrl = process.env.NEXT_PUBLIC_STRAPI_CLOUD_URL;
   const baseUrl = cloudUrl
      ? cloudUrl.replace(".strapiapp.com", ".media.strapiapp.com")
      : process.env.NEXT_PUBLIC_STRAPI_LOCAL_URL || "http://localhost:1337";

   // Sanitize leading and trailing slashes to build a clean absolute URL
   const cleanBaseUrl = baseUrl.replace(/\/$/, "");
   const cleanRelativeUrl = url.replace(/^\//, "");

   return `${cleanBaseUrl}/${cleanRelativeUrl}`;
}

// Helper function to format any raw inputs into strict E.164 standard
// Improved formatE164 that handles ISO codes, dial codes, or full country strings
export function formatE164(countryVal: string, rawNumber: string) {
   // If `countryVal` is an ISO code like "PK", map it to the dial code or ensure dial code extraction
   let cleanCountry = countryVal;

   // If passed an ISO code (e.g. "PK"), fall back to numeric dial code matching if needed
   if (!/\d/.test(countryVal)) {
      // Replace with a mapping or your dial code variable if stored separately
      // Example: if stored as ISO code "PK", use its dial code "92"
      cleanCountry = "92"; // Default fallback or extract from countryOptions
   }

   const countryDigits = cleanCountry.replace(/\D/g, "");
   let phoneDigits = rawNumber.replace(/\D/g, "");

   // Strip leading 0 if present (e.g., "0347..." -> "347...")
   if (phoneDigits.startsWith("0")) {
      phoneDigits = phoneDigits.substring(1);
   }

   return `+${countryDigits}${phoneDigits}`;
}

// date formater function for date picker
export function formatLocalDate(date: Date): string {
   const year = date.getFullYear();
   // getMonth() is 0-indexed, so add 1 and pad with leading zero
   const month = String(date.getMonth() + 1).padStart(2, "0");
   const day = String(date.getDate()).padStart(2, "0");

   return `${year}-${month}-${day}`;
}
