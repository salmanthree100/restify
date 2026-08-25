"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useCurrency } from "@/context/CurrencyContext";
import qs from "qs";
import { getStrapiMedia } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Container, Spinner } from "react-bootstrap";
import Slider from "react-slick";
import {
   FaStar,
   FaHeart,
   FaRegHeart,
   FaChevronLeft,
   FaChevronRight,
} from "react-icons/fa";
import { IoBedOutline, IoLocationOutline } from "react-icons/io5";
import { BiBath } from "react-icons/bi";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface PropertyImage {
   id: number;
   documentId: string;
   url: string;
   alternativeText: string | null;
   width: number;
   height: number;
}

interface PropertyData {
   id: number;
   documentId: string;
   title: string;
   slug: string;
   address: string;
   rating: number;
   reviewsCount: number;
   bedrooms: number;
   bathrooms: number;
   pricePerNight: number;
   bedroomsText: string;
   bathroomsText: string;
   pricePerNightText: string;
   isTrending: boolean;
   images?: PropertyImage[];
}

interface LocationsData {
   id: number;
   highlightTitle: string;
   mainTitle: string;
   locations: PropertyData[];
}

const TrendingLocations = () => {
   const { locale } = useLocale();
   const [locationsData, setLocationsData] = useState<LocationsData | null>(
      null,
   );
   const [loading, setLoading] = useState<boolean>(true);
   const sliderRef = useRef<Slider | null>(null);

   useEffect(() => {
      async function fetchLocationsData() {
         setLoading(true);

         const query = qs.stringify(
            {
               locale,
               populate: {
                  trendingLocations: {
                     populate: {
                        locations: {
                           populate: "*",
                        },
                     },
                  },
               },
            },
            { encodeValuesOnly: true },
         );

         try {
            const res = await fetch(`/api/strapi/home-page?${query}`);
            if (!res.ok) throw new Error("Failed to fetch data");

            const result = await res.json();
            setLocationsData(result?.data?.trendingLocations || null);
         } catch (error) {
            console.error("Error fetching trendingLocations section:", error);
         } finally {
            setLoading(false);
         }
      }

      fetchLocationsData();
   }, [locale]);

   if (loading) {
      return (
         <section className="py-5 bg-white text-center">
            <Spinner animation="border" variant="danger" />
         </section>
      );
   }

   if (!locationsData || !locationsData.locations?.length) return null;

   const { highlightTitle, mainTitle, locations } = locationsData;

   const cleanMainTitle =
      highlightTitle && mainTitle.startsWith(highlightTitle)
         ? mainTitle.replace(highlightTitle, "").trim()
         : mainTitle;

   const sliderSettings = {
      dots: false,
      infinite: locations.length > 4,
      speed: 500,
      slidesToShow: 4,
      slidesToScroll: 1,
      arrows: false,
      responsive: [
         { breakpoint: 1200, settings: { slidesToShow: 3 } },
         { breakpoint: 992, settings: { slidesToShow: 2 } },
         { breakpoint: 576, settings: { slidesToShow: 1 } },
      ],
   };

   return (
      <section className="py-5 bg-white">
         <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
               <h2 className="fw-bold fs-1 text-dark m-0">
                  <span className="primary-text">{highlightTitle}</span>{" "}
                  <span className="text-dark">{cleanMainTitle}</span>
               </h2>

               <div className="d-flex gap-2">
                  <button
                     onClick={() => sliderRef.current?.slickPrev()}
                     className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0"
                     style={{ width: "40px", height: "40px" }}
                     aria-label="Previous"
                  >
                     <FaChevronLeft size={14} />
                  </button>
                  <button
                     onClick={() => sliderRef.current?.slickNext()}
                     className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0"
                     style={{ width: "40px", height: "40px" }}
                     aria-label="Next"
                  >
                     <FaChevronRight size={14} />
                  </button>
               </div>
            </div>

            <div className="trending-locations-slider mx-n2">
               <Slider ref={sliderRef} {...sliderSettings}>
                  {locations.map((item) => (
                     <div key={item.id} className="px-2 h-100">
                        <LocationCard item={item} />
                     </div>
                  ))}
               </Slider>
            </div>
         </Container>
      </section>
   );
};

function LocationCard({ item }: { item: PropertyData }) {
   const [isFavorite, setIsFavorite] = useState(false);
   const { formatPrice } = useCurrency(); // Accessing formatPrice from Currency Context

   const firstImage = item.images?.[0];
   const imageUrl = getStrapiMedia(firstImage?.url);

   return (
      <div className="card h-100 rounded-4 border shadow-sm overflow-hidden d-flex flex-column">
         <div className="position-relative w-100" style={{ height: "220px" }}>
            {imageUrl ? (
               <Image
                  src={imageUrl}
                  alt={firstImage?.alternativeText || item.title}
                  fill
                  sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 25vw"
                  className="object-fit-cover"
               />
            ) : (
               <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center text-muted">
                  No Image
               </div>
            )}

            <button
               onClick={() => setIsFavorite(!isFavorite)}
               className="btn position-absolute top-0 end-0 m-3 p-0 rounded-circle d-flex align-items-center justify-content-center"
               style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  color: isFavorite ? "#dc3545" : "#ffffff",
                  border: "none",
                  zIndex: 2,
               }}
               aria-label="Favorite"
            >
               {isFavorite ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
            </button>
         </div>

         <div className="card-body p-3 d-flex flex-column justify-content-between">
            <div>
               <div className="d-flex justify-content-between align-items-start mb-1">
                  <h3 className="card-title fw-semibold fs-6 text-dark mb-0 text-truncate pe-2">
                     <Link
                        href={`/properties/${item.slug}`}
                        className="text-decoration-none text-dark"
                     >
                        {item.title}
                     </Link>
                  </h3>
                  <div className="d-flex align-items-center gap-1 flex-shrink-0 small fw-bold">
                     <FaStar className="text-warning mb-1" size={14} />
                     <span>{item.rating}</span>
                     <span className="text-secondary font-normal">
                        ({item.reviewsCount})
                     </span>
                  </div>
               </div>

               <p className="text-secondary small mb-2 text-truncate">
                  <IoLocationOutline className="me-1 mb-1" />
                  {item.address}
               </p>

               <div className="d-flex align-items-center gap-3 text-secondary small mb-3">
                  <div className="d-flex align-items-center gap-1">
                     <IoBedOutline size={16} />
                     <span>
                        {item.bedrooms} {item.bedroomsText}
                     </span>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                     <BiBath size={16} />
                     <span>
                        {item.bathrooms} {item.bathroomsText}
                     </span>
                  </div>
               </div>
            </div>

            {/* Currency context formatting applied here */}
            <div className="d-flex align-items-baseline gap-1 pt-2 border-top">
               <span className="fw-bold fs-5 text-dark">
                  {formatPrice(item.pricePerNight)}
               </span>
               <span className="text-secondary small">
                  {item.pricePerNightText}
               </span>
            </div>
         </div>
      </div>
   );
}

export default TrendingLocations;
