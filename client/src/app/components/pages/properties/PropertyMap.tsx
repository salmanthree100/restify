"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Image from "next/image";
import "leaflet/dist/leaflet.css";

// 1. Fix Leaflet default marker icon paths in Next.js
const customIcon = new L.Icon({
   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
   iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
   iconSize: [25, 41],
   iconAnchor: [12, 41],
   popupAnchor: [1, -34],
   shadowSize: [41, 41],
});

interface Property {
   id: number | string;
   title?: string;
   pricePerNight?: number;
   latitude?: number;
   longitude?: number;
   images?: Array<{ url: string }>;
}

interface PropertyMapProps {
   properties: Property[];
}

// 2. Helper component to auto-recenter map when properties change
function MapRecenter({ properties }: { properties: Property[] }) {
   const map = useMap();

   useEffect(() => {
      const validCoords = properties
         .filter(
            (p) =>
               typeof p.latitude === "number" &&
               typeof p.longitude === "number",
         )
         .map((p) => [p.latitude!, p.longitude!] as [number, number]);

      if (validCoords.length > 0) {
         const bounds = L.latLngBounds(validCoords);
         map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
   }, [properties, map]);

   return null;
}

export default function PropertyMap({ properties }: PropertyMapProps) {
   // Filter out properties missing latitude or longitude
   const validProperties = properties.filter(
      (p) =>
         p.latitude !== undefined &&
         p.longitude !== undefined &&
         p.latitude !== null &&
         p.longitude !== null,
   );

   // Default center if no coordinates are available (e.g., Sydney)
   const defaultCenter: [number, number] =
      validProperties.length > 0
         ? [validProperties[0].latitude!, validProperties[0].longitude!]
         : [-33.8688, 151.2093];

   return (
      <div
         className="w-100 h-100 rounded-3 overflow-hidden shadow-sm"
         style={{ minHeight: "500px" }}
      >
         <MapContainer
            center={defaultCenter}
            zoom={12}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
         >
            <TileLayer
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapRecenter properties={validProperties} />

            {validProperties.map((property) => (
               <Marker
                  key={property.id}
                  position={[property.latitude!, property.longitude!]}
                  icon={customIcon}
               >
                  <Popup className="property-map-popup">
                     <div style={{ width: "180px" }}>
                        {property.images && property.images[0] && (
                           <div
                              className="position-relative w-100 mb-2"
                              style={{ height: "100px" }}
                           >
                              <Image
                                 src={
                                    property.images[0].url.startsWith("http")
                                       ? property.images[0].url
                                       : `${process.env.NEXT_PUBLIC_STRAPI_LOCAL_URL || "http://localhost:1337"}${property.images[0].url}`
                                 }
                                 alt={property.title || "Property"}
                                 fill
                                 className="object-fit-cover rounded"
                              />
                           </div>
                        )}
                        <h6
                           className="m-0 text-truncate font-weight-bold"
                           style={{ fontSize: "14px" }}
                        >
                           {property.title}
                        </h6>
                        <p
                           className="m-0 text-primary fw-bold"
                           style={{ fontSize: "13px" }}
                        >
                           ${property.pricePerNight}{" "}
                           <span className="text-muted fw-normal">/ night</span>
                        </p>
                     </div>
                  </Popup>
               </Marker>
            ))}
         </MapContainer>
      </div>
   );
}
