"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Container } from "react-bootstrap";
import { PropertyCard } from "./PropertyCard";
import { Property } from "@/app/types";

// Dynamically import PropertyMap with SSR disabled
const PropertyMap = dynamic(() => import("./PropertyMap"), {
   ssr: false,
   loading: () => (
      <div
         className="w-100 h-100 bg-light d-flex align-items-center justify-content-center rounded"
         style={{ minHeight: "500px" }}
      >
         <span className="text-muted">Loading map view...</span>
      </div>
   ),
});

interface PropertyGridProps {
   properties: Property[];
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({ properties }) => {
   const [showMap, setShowMap] = useState(true);

   if (!properties || properties.length === 0) {
      return (
         <Container className="py-5 text-center">
            <h5 className="fw-semibold text-secondary">No properties found</h5>
            <p className="text-muted small">
               Try adjusting your destination or filter options.
            </p>
         </Container>
      );
   }

   return (
      <section style={{ margin: "100px 0" }}>
         <Container fluid="xl" className="py-4">
            <div className="container-fluid">
               {/* View Mode Toggle Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="m-0 fw-bold">
                     {properties.length} Places to Stay
                  </h5>
                  <button
                     className="btn btn-outline-dark btn-sm rounded-pill px-3"
                     onClick={() => setShowMap(!showMap)}
                  >
                     {showMap ? "Hide Map" : "Show Map View"}
                  </button>
               </div>

               {showMap ? (
                  /* Split Screen View: Grid on Left, Sticky Map on Right */
                  <div className="row g-4">
                     <div className="col-lg-7 col-xl-8">
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                           {properties.map((property) => (
                              <div className="col" key={property.id}>
                                 <PropertyCard property={property} />
                              </div>
                           ))}
                        </div>
                     </div>
                     <div className="col-lg-5 col-xl-4">
                        <div
                           className="sticky-top"
                           style={{
                              top: "90px",
                              height: "calc(100vh - 120px)",
                           }}
                        >
                           <PropertyMap properties={properties} />
                        </div>
                     </div>
                  </div>
               ) : (
                  /* Full-width Grid View */
                  <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                     {properties.map((property) => (
                        <div className="col" key={property.id}>
                           <PropertyCard property={property} />
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </Container>
      </section>
   );
};
