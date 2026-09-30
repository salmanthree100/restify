"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Container } from "react-bootstrap";
import { Property } from "../PropertyMap";

const PropertyMap = dynamic(() => import("../PropertyMap"), {
   ssr: false,
});

interface LocationSectionProps {
   locationText?: string;
   subLocationText?: string;
   latitude?: number;
   longitude?: number;
   title?: string;
}

const LocationSection: React.FC<LocationSectionProps> = ({
   locationText,
   subLocationText = "Exact location will be provided after booking.",
   latitude,
   longitude,
   title,
}) => {
   if (latitude === undefined || longitude === undefined) {
      return null;
   }

   const singleProperty: Property[] = [
      {
         id: "single-property-map",
         title,
         latitude,
         longitude,
      },
   ];

   return (
      <section className="py-5">
         <Container>
            <div className="mb-3">
               <h3 className="fw-bold fs-4 text-dark mb-3">
                  Where you&apos;ll be
               </h3>
               {locationText && (
                  <p className="text-secondary fw-medium mb-3 fs-6">
                     {locationText}
                  </p>
               )}
               <p className="text-muted small mb-0">{subLocationText}</p>
            </div>

            <PropertyMap
               properties={singleProperty}
               zoom={13}
               height="450px"
               showPopup={false}
            />
         </Container>
      </section>
   );
};

export default LocationSection;
