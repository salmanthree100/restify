// src/components/search/GuestPopover.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import { FaPlus, FaMinus } from "react-icons/fa6";

export interface GuestCategoryConfig {
   id: number;
   key: string; // "adults" | "children" | "infants" | "pets"
   title: string;
   subtitle: string;
   defaultValue?: number;
   min?: number;
   max?: number;
}

export interface GuestCounts {
   [key: string]: number;
}

interface GuestPopoverProps {
   isOpen: boolean;
   onClose: () => void;
   guestCounts: GuestCounts;
   onChangeCounts: (newCounts: GuestCounts) => void;
}

export default function GuestPopover({
   isOpen,
   onClose,
   guestCounts,
   onChangeCounts,
}: GuestPopoverProps) {
   const [categories, setCategories] = useState<GuestCategoryConfig[]>([]);
   const popoverRef = useRef<HTMLDivElement>(null);
   const { locale } = useLocale();

   const query = qs.stringify(
      {
         locale,
         populate: {
            hero: {
               on: {
                  "blocks.hero-section": {
                     populate: {
                        guestMenu: true,
                     },
                  },
               },
            },
         },
      },
      { encodeValuesOnly: true },
   );

   // 1. Fetch Guest Configs from Strapi API
   useEffect(() => {
      const fetchGuestConfigs = async () => {
         try {
            const res = await fetch(`/api/strapi/home-page?${query}`);
            const data = await res.json();
            console.log(data?.data.hero?.[0]?.guestMenu);

            // Dynamic categories fallback if Strapi API isn't populated yet
            const fetchedConfigs: GuestCategoryConfig[] =
               data?.data?.hero?.[0]?.guestMenu;

            setCategories(fetchedConfigs);
         } catch (err) {
            console.error("Failed to load guest configurations:", err);
         }
      };

      fetchGuestConfigs();
   }, [query]);

   // 2. Click Outside Handler
   useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
         if (
            popoverRef.current &&
            !popoverRef.current.contains(e.target as Node)
         ) {
            onClose();
         }
      };

      if (isOpen) {
         document.addEventListener("mousedown", handleClickOutside);
      }
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, [isOpen, onClose]);

   if (!isOpen) return null;

   // 3. Counter Helper Functions
   const handleUpdate = (cat: GuestCategoryConfig, delta: number) => {
      const currentVal = guestCounts[cat.key] ?? (cat.defaultValue || 0);
      const minVal = cat.min ?? 0;
      const maxVal = cat.max ?? 10;
      const newVal = Math.min(Math.max(currentVal + delta, minVal), maxVal);

      // Auto-increment Adults to at least 1 if Children/Infants/Pets are selected
      const updatedCounts = { ...guestCounts, [cat.key]: newVal };
      if (
         cat.key !== "adults" &&
         newVal > 0 &&
         (guestCounts.adults || 0) === 0
      ) {
         updatedCounts.adults = 1;
      }

      onChangeCounts(updatedCounts);
   };

   return (
      <div
         ref={popoverRef}
         onMouseDown={(e) => e.stopPropagation()}
         className="position-absolute end-0 top-100 mt-3 bg-white rounded-5 shadow-lg p-4 z-3 border"
         style={{
            width: "380px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
         }}
      >
         {/* Close Header */}
         <div className="d-flex justify-content-end mb-2">
            <button
               type="button"
               onClick={onClose}
               className="btn-close shadow-none"
               aria-label="Close"
               style={{ width: "12px", height: "12px" }}
            />
         </div>

         {/* Guest Category Rows */}
         <div className="d-flex flex-column gap-3">
            {categories.map((cat, index) => {
               const val = guestCounts[cat.key] ?? cat.defaultValue ?? 0;
               const isMin = val <= (cat.min ?? 0);
               const isMax = val >= (cat.max ?? 10);

               return (
                  <div key={cat.id || cat.key}>
                     <div className="d-flex align-items-center justify-content-between py-2">
                        <div>
                           <div className="fw-bold text-dark fs-6">
                              {cat.title}
                           </div>
                           <div className="text-muted extra-small">
                              {cat.subtitle}
                           </div>
                        </div>

                        {/* Plus / Minus Counter Controls */}
                        <div className="d-flex align-items-center gap-3">
                           <button
                              type="button"
                              disabled={isMin}
                              onClick={() => handleUpdate(cat, -1)}
                              className="btn rounded-circle border-dark d-flex align-items-center justify-content-center p-0 shadow-none"
                              style={{
                                 width: "32px",
                                 height: "32px",
                                 opacity: isMin ? 0.3 : 1,
                                 cursor: isMin ? "not-allowed" : "pointer",
                              }}
                           >
                              <FaMinus size={16} color="#202020" />
                           </button>

                           <span
                              className="fw-bold text-dark small"
                              style={{ minWidth: "16px", textAlign: "center" }}
                           >
                              {val}
                           </span>

                           <button
                              type="button"
                              disabled={isMax}
                              onClick={() => handleUpdate(cat, 1)}
                              className="btn rounded-circle border-dark d-flex align-items-center justify-content-center p-0 shadow-none"
                              style={{
                                 width: "32px",
                                 height: "32px",
                                 opacity: isMax ? 0.3 : 1,
                                 cursor: isMax ? "not-allowed" : "pointer",
                              }}
                           >
                              <FaPlus size={16} color="#202020" />
                           </button>
                        </div>
                     </div>

                     {index < categories.length - 1 && (
                        <hr className="my-2 opacity-5" />
                     )}
                  </div>
               );
            })}
         </div>
      </div>
   );
}
