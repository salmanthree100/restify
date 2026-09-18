"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Container, Pagination } from "react-bootstrap";
import { PropertyCard } from "./PropertyCard";
import { Property } from "@/app/types";
import SearchFilterModal from "@/app/components/common/SearchFilterModal";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { IoFilterSharp } from "react-icons/io5";
import { useLocale } from "@/context/LocaleContext";

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

export interface PaginationMeta {
   page: number;
   pageSize: number;
   pageCount: number;
   total: number;
}

interface PropertyGridProps {
   properties: Property[];
   pagination?: PaginationMeta | null;
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({
   properties,
   pagination,
}) => {
   const [showMap, setShowMap] = useState(true);
   const [showFilter, setShowFilter] = useState(false);
   const handleClose = () => setShowFilter(false);

   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();
   const { t } = useLocale();

   // Handle changing page by preserving current search params
   const handlePageChange = (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`${pathname}?${params.toString()}`);
   };

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

   const page = pagination?.page || 1;
   const pageCount = pagination?.pageCount || 1;

   return (
      <section style={{ margin: "100px 0" }}>
         <Container fluid className="px-3">
            <div>
               {/* View Mode Toggle Header */}
               <div className="row d-flex align-items-center justify-content-between mb-4">
                  <div className="d-flex align-items-center justify-content-between col-lg-7 col-xl-8">
                     <div>
                        <h5 className="m-0 fw-bold">
                           {pagination?.total ?? properties.length}{" "}
                           {t.propertyGrid.placesToStay}
                        </h5>
                     </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-end col-lg-5 col-xl-4">
                     <div className="me-2">
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
                     <div>
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
                        {/* Pagination Controls */}
                        {pageCount > 1 && (
                           <div className="d-flex justify-content-center mt-5">
                              <Pagination>
                                 <Pagination.Prev
                                    disabled={page === 1}
                                    onClick={() => handlePageChange(page - 1)}
                                 />
                                 {Array.from(
                                    { length: pageCount },
                                    (_, i) => i + 1,
                                 ).map((p) => (
                                    <Pagination.Item
                                       key={p}
                                       active={p === page}
                                       onClick={() => handlePageChange(p)}
                                    >
                                       {p}
                                    </Pagination.Item>
                                 ))}
                                 <Pagination.Next
                                    disabled={page === pageCount}
                                    onClick={() => handlePageChange(page + 1)}
                                 />
                              </Pagination>
                           </div>
                        )}
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

               {/* Pagination Controls */}
               {!showMap && pageCount > 1 && (
                  <div className="d-flex justify-content-center mt-5">
                     <Pagination>
                        <Pagination.Prev
                           disabled={page === 1}
                           onClick={() => handlePageChange(page - 1)}
                        />
                        {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                           (p) => (
                              <Pagination.Item
                                 key={p}
                                 active={p === page}
                                 onClick={() => handlePageChange(p)}
                              >
                                 {p}
                              </Pagination.Item>
                           ),
                        )}
                        <Pagination.Next
                           disabled={page === pageCount}
                           onClick={() => handlePageChange(page + 1)}
                        />
                     </Pagination>
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
