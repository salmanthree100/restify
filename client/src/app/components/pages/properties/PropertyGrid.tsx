"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Container } from "react-bootstrap";
import { PropertyCard } from "./PropertyCard";
import { Property } from "@/app/types";
import SearchFilterModal from "@/app/components/common/SearchFilterModal";
import { useRouter } from "next/navigation";
import { IoFilterSharp } from "react-icons/io5";
import { useLocale } from "@/context/LocaleContext";

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
   const [showFilter, setShowFilter] = useState(false);
   const handleClose = () => setShowFilter(false);
   const router = useRouter();
   const { t } = useLocale();

   if (!properties || properties.length === 0) {
      return (
         <div className="text-center" style={{ margin: "100px 0" }}>
            <h4 className="fw-bold">{t.propertyGrid.noResultText}</h4>
            <p className="text-muted">{t.propertyGrid.noResultMessage}</p>
            <button
               className="btn btn-outline-dark rounded-pill px-4 mt-2"
               onClick={() => router.push("/properties")}
            >
               {t.propertyGrid.clearAllFilters}
            </button>
         </div>
      );
   }

   return (
      <section style={{ margin: "100px 0" }}>
         <Container fluid className="px-3">
            <div>
               {/* View Mode Toggle Header */}
               <div className="row d-flex align-items-center justify-content-between mb-4">
                  <div
                     className={`d-flex align-items-center justify-content-between ${showMap ? "col-lg-7 col-xl-8" : "col-9"}`}
                  >
                     <div>
                        <h5 className="m-0 fw-bold">
                           {properties.length} {t.propertyGrid.placesToStay}
                        </h5>
                     </div>
                     <div>
                        <button
                           className="btn btn-outline-dark btn-sm rounded-3 px-3"
                           onClick={() => setShowFilter(!showFilter)}
                        >
                           <span>
                              <IoFilterSharp className="me-2" />
                              {t.propertyGrid.filterBtn}
                           </span>
                        </button>
                     </div>
                  </div>
                  <div
                     className={`${showMap ? "col-lg-5 col-xl-4 text-end" : "col-3 text-end"}`}
                  >
                     <button
                        className="btn btn-outline-dark btn-sm rounded-3 px-3"
                        onClick={() => setShowMap(!showMap)}
                     >
                        {showMap
                           ? t.propertyGrid.hideMap
                           : t.propertyGrid.showMap}
                     </button>
                  </div>
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
               {showFilter && (
                  <SearchFilterModal
                     isOpen={showFilter}
                     onClose={handleClose}
                  />
               )}
            </div>
         </Container>
      </section>
   );
};
