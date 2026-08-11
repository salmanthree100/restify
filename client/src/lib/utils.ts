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
