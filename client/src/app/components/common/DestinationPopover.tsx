// src/components/search/DestinationPopover.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/utils";
import { TiLocationArrowOutline } from "react-icons/ti";
import { useLocale } from "@/context/LocaleContext";

export interface Destination {
   id: number;
   title: string;
   description?: string;
   icon?: { url: string };
   iconBgColor?: string;
}

export interface RecentSearch {
   title: string;
   subtitle: string;
   iconUrl?: string; // <--- Add this
   iconBgColor?: string; // <--- Add this
}

interface PopoverProps {
   isOpen: boolean;
   searchQuery: string; // Add searchQuery prop here
   onClose: () => void;
   // Update this to accept an object matching the RecentSearch shape:
   onSelectDestination: (destination: {
      title: string;
      subtitle?: string;
      description?: string;
      iconUrl?: string;
      iconBgColor?: string;
      lat?: number; // <--- Add this
      lng?: number; // <--- Add this
   }) => void;
}

// Define the expected shape of a single Strapi Destination item
interface StrapiDestinationItem {
   id: number;
   title?: string;
   description?: string;
   iconBgColor?: string;
   icon?: {
      url: string;
   };
}

interface PhotonFeature {
   geometry: {
      coordinates: [number, number]; // [lng, lat]
   };
   properties: {
      osm_id: number;
      name?: string;
      city?: string;
      state?: string;
      country?: string;
      type?: string;
   };
}

export default function DestinationPopover({
   isOpen,
   searchQuery,
   onClose,
   onSelectDestination,
}: PopoverProps) {
   const [destinations, setDestinations] = useState<Destination[]>([]);
   const popoverRef = useRef<HTMLDivElement>(null);
   const [photonResults, setPhotonResults] = useState<PhotonFeature[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   // 1. Add loading state for location permission check
   const [isGettingLocation, setIsGettingLocation] = useState(false);
   const { locale } = useLocale();

   // 1. Fetch Suggested Destinations from Strapi
   useEffect(() => {
      const fetchDestinations = async () => {
         try {
            const res = await fetch(
               `/api/strapi/destinations?populate=icon&locale=${locale}`,
            );
            const data = await res.json();

            if (Array.isArray(data?.data)) {
               setDestinations(
                  data.data.map((item: StrapiDestinationItem) => ({
                     id: item.id,
                     title: item.title || "",
                     description: item.description,
                     icon: item.icon,
                     iconBgColor: item.iconBgColor || "#f8f9fa",
                  })),
               );
            }
         } catch (err) {
            console.error("Failed to load destinations:", err);
         }
      };

      fetchDestinations();
   }, [locale]);

   // 1. Remove useState for recentSearch completely!
   // 2. Derive it directly during render:

   let recentSearch: RecentSearch | null = null;
   if (isOpen && typeof window !== "undefined") {
      const saved = localStorage.getItem("recent_search");
      if (saved) {
         try {
            recentSearch = JSON.parse(saved);
         } catch {
            recentSearch = null;
         }
      }
   }

   // 3. Click Outside Listener to close Popover
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
      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, [isOpen, onClose]);

   // Fetch live suggestions from Photon (Komoot)
   useEffect(() => {
      // If query is too short, we don't need to trigger a sync setState inside the effect body.
      if (searchQuery.trim().length < 2) {
         return;
      }

      // 1. Debounce network requests by 300ms
      const timer = setTimeout(async () => {
         // Setting state inside a timer/callback is asynchronous, which satisfies React's strict rules
         setIsLoading(true);

         try {
            const res = await fetch(
               `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=6`,
            );
            const data = await res.json();

            if (data?.features) {
               setPhotonResults(data.features);
            } else {
               setPhotonResults([]);
            }
         } catch (err) {
            console.error("Photon API Error:", err);
            setPhotonResults([]);
         } finally {
            setIsLoading(false);
         }
      }, 300);

      return () => clearTimeout(timer);
   }, [searchQuery]);

   // 2. Handle "Use Current Location"
   const handleUseCurrentLocation = () => {
      if (!navigator.geolocation) {
         alert("Geolocation is not supported by your browser.");
         return;
      }

      setIsGettingLocation(true);

      navigator.geolocation.getCurrentPosition(
         async (position) => {
            const { latitude, longitude } = position.coords;

            try {
               // Reverse geocode using Photon API: lat/lon -> Address
               const res = await fetch(
                  `https://photon.komoot.io/reverse?lon=${longitude}&lat=${latitude}`,
               );
               const data = await res.json();

               if (data?.features?.length > 0) {
                  const place = data.features[0].properties;
                  const mainTitle =
                     place.name ||
                     place.city ||
                     place.locality ||
                     "Current Location";
                  const locationParts = [
                     place.city,
                     place.state,
                     place.country,
                  ].filter((p) => p && p !== mainTitle);
                  const subtitle = locationParts.join(", ");

                  onSelectDestination({
                     title: mainTitle,
                     description: subtitle || "Your current location",
                     lat: latitude,
                     lng: longitude,
                     iconBgColor: "#E3F2FD",
                  });
               } else {
                  // Fallback if reverse geocoding finds no address name
                  onSelectDestination({
                     title: "Nearby Location",
                     description: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
                     lat: latitude,
                     lng: longitude,
                  });
               }
            } catch (err) {
               console.error("Failed to reverse geocode location:", err);
            } finally {
               setIsGettingLocation(false);
            }
         },
         (error) => {
            console.error("Geolocation error:", error);
            setIsGettingLocation(false);
            alert(
               "Unable to retrieve your location. Please check browser permissions.",
            );
         },
      );
   };

   // Compute active results directly during render:
   const activeResults = searchQuery.trim().length >= 2 ? photonResults : [];
   const isSearching = searchQuery.trim().length >= 2;

   if (!isOpen) return null;

   return (
      <div
         ref={popoverRef}
         onMouseDown={(e) => e.stopPropagation()} // 👈 Stop clicks inside from bubbling up
         className="position-absolute start-0 top-100 mt-3 bg-white rounded-5 shadow-lg p-4 z-3 border overflow-y-auto"
         style={{
            width: "420px",
            maxHeight: "520px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
         }}
      >
         {/* ================= MODE A: PHOTON SEARCH RESULTS ================= */}
         {isSearching ? (
            <div>
               <div className="text-muted extra-small fw-semibold mb-3">
                  Search Results
               </div>

               {isLoading ? (
                  <div className="text-center p-3 text-muted small">
                     Searching...
                  </div>
               ) : activeResults.length === 0 ? (
                  <div className="text-center p-3 text-muted small">
                     No places found
                  </div>
               ) : (
                  <div className="d-flex flex-column gap-1">
                     {activeResults.map((item, index) => {
                        const { name, city, state, country, osm_id } =
                           item.properties;
                        const [lng, lat] = item.geometry.coordinates;

                        const mainTitle =
                           name || city || country || "Unknown Location";
                        const locationParts = [city, state, country].filter(
                           (p) => p && p !== mainTitle,
                        );
                        const subtitle = locationParts.join(", ");

                        return (
                           <div
                              key={`${osm_id}-${index}`}
                              onClick={(e) => {
                                 e.stopPropagation();
                                 onSelectDestination({
                                    title: mainTitle,
                                    description: subtitle,
                                    lat,
                                    lng,
                                    iconBgColor: "#F1F3F5",
                                 });
                              }}
                              className="d-flex align-items-center gap-3 p-2 rounded-4 hover-bg-light cursor-pointer"
                           >
                              <div
                                 className="rounded-4 d-flex align-items-center justify-content-center flex-shrink-0"
                                 style={{
                                    width: "48px",
                                    height: "48px",
                                    backgroundColor: "#E9ECEF",
                                 }}
                              >
                                 <i className="bi bi-geo-alt text-dark fs-5"></i>
                              </div>
                              <div>
                                 <div className="fw-bold text-dark small">
                                    {mainTitle}
                                 </div>
                                 {subtitle && (
                                    <div className="text-muted extra-small">
                                       {subtitle}
                                    </div>
                                 )}
                              </div>
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>
         ) : (
            /* ================= MODE B: SUGGESTED & RECENT SEARCHES ================= */
            <div>
               {/* --- Section: Nearby / Use Current Location --- */}
               <div className="mb-3">
                  <div
                     onClick={(e) => {
                        e.stopPropagation();
                        handleUseCurrentLocation();
                     }}
                     className="d-flex align-items-center gap-3 p-2 rounded-4 hover-bg-light cursor-pointer"
                  >
                     <div
                        className="rounded-4 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                           width: "48px",
                           height: "48px",
                           backgroundColor: "#FDE7E3",
                        }}
                     >
                        {isGettingLocation ? (
                           <div
                              className="spinner-border spinner-border-sm text-primary"
                              role="status"
                           />
                        ) : (
                           <TiLocationArrowOutline color="#AA250E" size={24} />
                        )}
                     </div>
                     <div>
                        <div className="fw-bold text-dark small">
                           {isGettingLocation
                              ? "Detecting location..."
                              : "Use current location"}
                        </div>
                        <div className="text-muted extra-small">
                           Find places nearby using GPS
                        </div>
                     </div>
                  </div>
               </div>
               {/* Recent Search */}
               {recentSearch && (
                  <div className="mb-4">
                     <div className="text-muted extra-small fw-semibold mb-3">
                        Recent search
                     </div>
                     <div
                        onClick={(e) => {
                           e.stopPropagation();
                           onSelectDestination(recentSearch!);
                        }}
                        className="d-flex align-items-center gap-3 p-2 rounded-4 hover-bg-light cursor-pointer"
                     >
                        <div
                           className="rounded-4 d-flex align-items-center justify-content-center flex-shrink-0"
                           style={{
                              width: "48px",
                              height: "48px",
                              backgroundColor: "#FFEAE6",
                           }}
                        >
                           {recentSearch.iconUrl ? (
                              <Image
                                 src={recentSearch.iconUrl}
                                 alt={recentSearch.title}
                                 width={24}
                                 height={24}
                              />
                           ) : (
                              <i className="bi bi-water text-danger fs-5"></i>
                           )}
                        </div>
                        <div>
                           <div className="fw-bold text-dark small">
                              {recentSearch.title}
                           </div>
                           <div className="text-muted extra-small">
                              {recentSearch.subtitle}
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* Suggested Destinations */}
               <div>
                  <div className="text-muted extra-small fw-semibold mb-3">
                     Suggested Destinations
                  </div>

                  <div className="d-flex flex-column gap-1">
                     {destinations.map((dest, index) => {
                        const iconUrl = dest.icon?.url
                           ? getStrapiMedia(dest.icon.url)
                           : null;

                        return (
                           <div
                              key={`${dest.id}-${index}`}
                              onClick={(e) => {
                                 e.stopPropagation();
                                 onSelectDestination({
                                    title: dest.title,
                                    description: dest.description,
                                    iconUrl: iconUrl || undefined,
                                    iconBgColor: dest.iconBgColor,
                                 });
                              }}
                              className="d-flex align-items-center gap-3 p-2 rounded-4 hover-bg-light cursor-pointer"
                           >
                              <div
                                 className="rounded-4 d-flex align-items-center justify-content-center flex-shrink-0"
                                 style={{
                                    width: "48px",
                                    height: "48px",
                                    backgroundColor:
                                       dest.iconBgColor || "#f1f3f5",
                                 }}
                              >
                                 {iconUrl ? (
                                    <Image
                                       src={iconUrl}
                                       alt={dest.title}
                                       width={24}
                                       height={24}
                                    />
                                 ) : (
                                    <i className="bi bi-geo-alt text-secondary fs-5"></i>
                                 )}
                              </div>

                              <div>
                                 <div className="fw-bold text-dark small">
                                    {dest.title}
                                 </div>
                                 {dest.description && (
                                    <div className="text-muted extra-small">
                                       {dest.description}
                                    </div>
                                 )}
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
