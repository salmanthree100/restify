import { buildPropertyQuery } from "@/lib/strapi-search";

interface PageProps {
   searchParams: Promise<{
      destination?: string;
      checkIn?: string;
      checkOut?: string;
      guests?: string;
      minPrice?: string;
      maxPrice?: string;
      page?: string;
   }>;
}

interface PropertyItem {
   id: number;
   attributes: {
      title: string;
      slug: string;
      pricePerNight: number;
      // ... add other relevant property attributes
   };
}

export default async function PropertiesPage({ searchParams }: PageProps) {
   const params = await searchParams;
   const queryString = buildPropertyQuery(params);

   // 1. Get the base URL with a fallback for local development
   const baseUrl =
      process.env.NEXT_PUBLIC_STRAPI_CLOUD_URL ||
      process.env.NEXT_PUBLIC_STRAPI_LOCAL_URL;

   const res = await fetch(`${baseUrl}/api/properties?${queryString}`, {
      cache: "no-store", // or revalidate
   });

   const { data: properties, meta } = await res.json();

   return (
      <div className="container-fluid py-4">
         <div className="row">
            {/* Left: Property Cards Grid (8 Cols) */}
            <div className="col-lg-7">
               <p className="text-muted">{meta.pagination.total} homes found</p>
               <div className="row g-4">
                  {properties.map((property: PropertyItem) => (
                     <div key={property.id} className="col-md-4">
                        {/* Property Card Component */}
                     </div>
                  ))}
               </div>
            </div>

            {/* Right: Map View (5 Cols, Sticky) */}
            <div className="col-lg-5 position-sticky top-0 style={{ height: '100vh' }}">
               {/* Render Map (Leaflet / Google Maps / Mapbox) with markers using property.latitude & longitude */}
            </div>
         </div>
      </div>
   );
}
