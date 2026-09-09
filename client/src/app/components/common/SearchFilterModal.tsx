"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import qs from "qs";
import { getStrapiMedia } from "@/lib/utils";
import Image from "next/image";
import { Spinner, Modal, Button } from "react-bootstrap";

interface IconData {
   url: string;
   alternativeText?: string;
}

interface AmenityItem {
   id: number;
   key: string;
   title: string;
   icon?: IconData;
}

interface PropertyTypeItem {
   id: number;
   key: string;
   label: string;
}

interface ModalData {
   modalTitle: string;
   priceRangeTitle: string;
   priceRangeText: string;
   minPrice: number;
   maxPrice: number;
   minPriceLabel: string;
   maxPriceLabel: string;
   clearAllLink: string;
   showPlacesBtn: string;
   amenities: AmenityItem[];
   propertyTypes: PropertyTypeItem[];
}

export default function SearchFilterModal({
   isOpen,
   onClose,
}: {
   isOpen: boolean;
   onClose: () => void;
}) {
   const router = useRouter();
   const searchParams = useSearchParams();
   const { locale } = useLocale();

   const [modalData, setModalData] = useState<ModalData | null>(null);
   const [isLoading, setIsLoading] = useState(true);

   // Local Form States
   // Compute derived defaults directly when rendering:
   const activeMinPrice = searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : (modalData?.minPrice ?? 30);

   const activeMaxPrice = searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : (modalData?.maxPrice ?? 500);

   const activePropertyType = searchParams.get("propertyType") || "any";

   // Initialize local form state with searchParams defaults
   const [selectedAmenities, setSelectedAmenities] = useState<
      Record<string, boolean>
   >(() => {
      const initial: Record<string, boolean> = {};
      modalData?.amenities?.forEach((item) => {
         initial[item.key] = searchParams.get(item.key) === "true";
      });
      return initial;
   });

   const [selectedPropertyType, setSelectedPropertyType] =
      useState<string>(activePropertyType);

   const [priceRange, setPriceRange] = useState({
      min: activeMinPrice,
      max: activeMaxPrice,
   });

   // 1. Fetch Strapi Modal Configuration
   useEffect(() => {
      async function fetchModalData() {
         setIsLoading(true);

         const query = qs.stringify(
            {
               populate: {
                  amenities: {
                     populate: ["icon"],
                  },
                  propertyTypes: "*",
               },
               locale,
            },
            { encodeValuesOnly: true },
         );

         try {
            const baseUrl =
               process.env.NEXT_PUBLIC_STRAPI_LOCAL_URL ||
               "http://localhost:1337";
            const res = await fetch(
               `${baseUrl}/api/filter-modal-config?${query}`,
            );
            if (!res.ok) throw new Error("Failed to fetch data");

            const result = await res.json();
            const data: ModalData = result?.data || null;

            if (data) {
               setModalData(data);
               // Set initial price slider defaults from Strapi
               setPriceRange({
                  min: data.minPrice ?? 30,
                  max: data.maxPrice ?? 500,
               });
            }
         } catch (error) {
            console.error("Error fetching search filter modal data:", error);
         } finally {
            setIsLoading(false);
         }
      }

      if (isOpen) {
         fetchModalData();
      }
   }, [locale, isOpen]);

   // Toggle Amenity Selection Card
   const toggleAmenity = (key: string) => {
      setSelectedAmenities((prev) => ({
         ...prev,
         [key]: !prev[key],
      }));
   };

   // Handle Clear All Filters
   const handleClearAll = () => {
      setSelectedAmenities({});
      setSelectedPropertyType("any");
      setPriceRange({
         min: modalData?.minPrice ?? 30,
         max: modalData?.maxPrice ?? 500,
      });
   };

   // Handle Apply button click (Pushes updated filters to Next.js URL)
   const handleApplyFilters = () => {
      const params = new URLSearchParams(searchParams.toString());

      // Update amenity boolean query params
      Object.entries(selectedAmenities).forEach(([key, isSelected]) => {
         if (isSelected) {
            params.set(key, "true");
         } else {
            params.delete(key);
         }
      });

      // Update Property Type query param
      if (selectedPropertyType && selectedPropertyType !== "any") {
         params.set("propertyType", selectedPropertyType);
      } else {
         params.delete("propertyType");
      }

      // Update Price range query params
      params.set("minPrice", priceRange.min.toString());
      params.set("maxPrice", priceRange.max.toString());

      // Reset pagination to page 1
      params.set("page", "1");

      router.push(`/properties?${params.toString()}`);
      onClose();
   };

   return (
      <Modal
         show={isOpen}
         onHide={onClose}
         size="lg"
         centered
         dialogClassName="filter-modal-dialog"
         contentClassName="border-0 rounded-4 shadow-lg overflow-hidden"
      >
         <Modal.Header closeButton className="border-bottom px-4 py-3">
            <Modal.Title className="fw-bold fs-5 text-dark m-0">
               {modalData?.modalTitle || "Recommended for you"}
            </Modal.Title>
         </Modal.Header>

         <Modal.Body className="p-4">
            {isLoading ? (
               <div className="py-5 text-center">
                  <Spinner animation="border" variant="dark" />
               </div>
            ) : (
               <div>
                  {/* 1. Amenities Selectable Cards */}
                  {modalData?.amenities && modalData.amenities.length > 0 && (
                     <div className="mb-4">
                        <div className="row row-cols-2 row-cols-sm-4 g-3">
                           {modalData.amenities.map((item) => {
                              const isSelected = !!selectedAmenities[item.key];
                              const imageUrl = item.icon?.url
                                 ? getStrapiMedia(item.icon.url)
                                 : null;

                              return (
                                 <div className="col" key={item.id}>
                                    <div
                                       onClick={() => toggleAmenity(item.key)}
                                       className={`card h-100 text-center p-3 rounded-4 cursor-pointer transition-all border-2 ${
                                          isSelected
                                             ? "border-dark bg-light shadow-sm"
                                             : "border-light-subtle bg-white hover-border-secondary"
                                       }`}
                                       style={{
                                          cursor: "pointer",
                                          transition: "all 0.2s ease",
                                       }}
                                    >
                                       <div
                                          className="position-relative mx-auto mb-2"
                                          style={{
                                             width: "64px",
                                             height: "64px",
                                          }}
                                       >
                                          {imageUrl ? (
                                             <Image
                                                src={imageUrl}
                                                alt={item.title}
                                                fill
                                                className="object-fit-contain"
                                             />
                                          ) : (
                                             <div className="w-100 h-100 bg-secondary-subtle rounded-3" />
                                          )}
                                       </div>
                                       <span className="fw-medium text-dark small mt-auto">
                                          {item.title}
                                       </span>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  )}

                  {/* 2. Property Type Segmented Pill Tabs */}
                  {modalData?.propertyTypes &&
                     modalData.propertyTypes.length > 0 && (
                        <div className="mb-4 pt-2">
                           <div className="bg-light p-1 rounded-pill d-flex align-items-center">
                              {modalData.propertyTypes.map((type) => {
                                 const isSelected =
                                    selectedPropertyType === type.key;
                                 return (
                                    <button
                                       key={type.id}
                                       type="button"
                                       onClick={() =>
                                          setSelectedPropertyType(type.key)
                                       }
                                       className={`btn flex-fill rounded-pill py-2 border-0 fw-medium text-nowrap transition-all ${
                                          isSelected
                                             ? "bg-white text-dark shadow-sm"
                                             : "text-secondary hover-text-dark"
                                       }`}
                                       style={{ fontSize: "14px" }}
                                    >
                                       {type.label}
                                    </button>
                                 );
                              })}
                           </div>
                        </div>
                     )}

                  <hr className="my-4 border-light-subtle" />

                  {/* 3. Price Range Section */}
                  <div>
                     <h6 className="fw-bold text-dark mb-1">
                        {modalData?.priceRangeTitle || "Price range"}
                     </h6>
                     <p className="text-secondary small mb-4">
                        {modalData?.priceRangeText ||
                           "Trip price, includes all fees"}
                     </p>

                     {/* Price Range Controls */}
                     <div className="row g-3 align-items-center mb-3">
                        <div className="col-6">
                           <div className="border rounded-3 p-2">
                              <label
                                 className="text-uppercase text-secondary small d-block mb-0"
                                 style={{ fontSize: "10px" }}
                              >
                                 {modalData?.minPriceLabel || "Minimum"}
                              </label>
                              <div className="d-flex align-items-center">
                                 <span className="me-1 fw-bold">$</span>
                                 <input
                                    type="number"
                                    className="form-control border-0 p-0 fw-bold bg-transparent shadow-none"
                                    value={priceRange.min}
                                    min={modalData?.minPrice ?? 0}
                                    max={priceRange.max}
                                    onChange={(e) =>
                                       setPriceRange((prev) => ({
                                          ...prev,
                                          min: Number(e.target.value),
                                       }))
                                    }
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="col-6">
                           <div className="border rounded-3 p-2">
                              <label
                                 className="text-uppercase text-secondary small d-block mb-0"
                                 style={{ fontSize: "10px" }}
                              >
                                 {modalData?.maxPriceLabel || "Maximum"}
                              </label>
                              <div className="d-flex align-items-center">
                                 <span className="me-1 fw-bold">$</span>
                                 <input
                                    type="number"
                                    className="form-control border-0 p-0 fw-bold bg-transparent shadow-none"
                                    value={priceRange.max}
                                    min={priceRange.min}
                                    max={modalData?.maxPrice ?? 2000}
                                    onChange={(e) =>
                                       setPriceRange((prev) => ({
                                          ...prev,
                                          max: Number(e.target.value),
                                       }))
                                    }
                                 />
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Dual Range Sliders */}
                     <div className="px-1">
                        <input
                           type="range"
                           className="form-range"
                           min={modalData?.minPrice ?? 0}
                           max={modalData?.maxPrice ?? 1000}
                           value={priceRange.min}
                           onChange={(e) =>
                              setPriceRange((prev) => ({
                                 ...prev,
                                 min: Math.min(
                                    Number(e.target.value),
                                    priceRange.max - 10,
                                 ),
                              }))
                           }
                        />
                     </div>
                  </div>
               </div>
            )}
         </Modal.Body>

         <Modal.Footer className="d-flex justify-content-between align-items-center px-4 py-3 border-top">
            <button
               type="button"
               className="btn btn-link text-dark text-decoration-underline p-0 fw-medium border-0"
               onClick={handleClearAll}
            >
               {modalData?.clearAllLink}
            </button>
            <Button
               variant="dark"
               className="rounded-3 px-4 py-2 fw-medium"
               onClick={handleApplyFilters}
               disabled={isLoading}
            >
               {modalData?.showPlacesBtn}
            </Button>
         </Modal.Footer>
      </Modal>
   );
}
