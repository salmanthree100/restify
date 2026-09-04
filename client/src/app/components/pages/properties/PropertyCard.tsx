"use client";

import React, { useState } from "react";
import { Card, Badge, Button, Carousel } from "react-bootstrap";
import {
   FaStar,
   FaHeart,
   FaRegHeart,
   FaBed,
   FaBath,
   FaUserGroup,
} from "react-icons/fa6";
import Link from "next/link";
import { Property } from "@/app/types";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";

interface PropertyCardProps {
   property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
   const [isLiked, setIsLiked] = useState(false);
   const { formatPrice } = useCurrency(); // Accessing formatPrice from Currency Context

   const images =
      property.images && property.images.length > 0
         ? property.images
         : [{ id: 0, url: "/placeholder-property.jpg" }];

   return (
      <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative group-hover-shadow transition-all">
         {/* --- CAROUSEL / IMAGE HEADER --- */}
         <div
            className="position-relative bg-light"
            style={{ aspectRatio: "4/3" }}
         >
            {/* Favorite Heart Button */}
            <Button
               variant="light"
               className="position-absolute top-0 end-0 m-3 z-3 rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm border-0"
               style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "rgba(255, 255, 255, 0.85)",
               }}
               onClick={(e) => {
                  e.preventDefault();
                  setIsLiked(!isLiked);
               }}
               aria-label="Save wishlist"
            >
               {isLiked ? (
                  <FaHeart size={16} className="text-danger" />
               ) : (
                  <FaRegHeart size={16} className="text-dark" />
               )}
            </Button>

            {/* Trending Badge */}
            {property.isTrending && (
               <Badge
                  bg="dark"
                  className="position-absolute top-0 start-0 m-3 z-3 px-3 py-2 rounded-pill fw-semibold shadow-sm"
               >
                  Trending
               </Badge>
            )}

            {/* React Bootstrap Carousel */}
            <Carousel
               indicators={images.length > 1}
               controls={images.length > 1}
               interval={null}
               className="h-100 w-100 property-carousel"
            >
               {images.map((img, idx) => (
                  <Carousel.Item key={img.id || idx} className="h-100">
                     <div
                        className="position-relative w-100 h-100"
                        style={{ minHeight: "220px" }}
                     >
                        <Image
                           src={
                              getStrapiMedia(img.url) ||
                              "/placeholder-property.jpg"
                           }
                           alt={property.title || "Property image"}
                           fill
                           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                           className="object-fit-cover d-block w-100 h-100"
                           priority={idx === 0}
                        />
                     </div>
                  </Carousel.Item>
               ))}
            </Carousel>
         </div>

         {/* --- CARD BODY --- */}
         <Card.Body className="d-flex flex-column p-3">
            {/* Title & Rating */}
            <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
               <Card.Title className="h6 fw-bold text-dark text-truncate mb-0">
                  {property.title}
               </Card.Title>
               <div className="d-flex align-items-center gap-1 text-dark fw-bold small flex-shrink-0">
                  <FaStar size={14} className="text-warning" />
                  <span>
                     {property.rating ? property.rating.toFixed(1) : "New"}
                  </span>
                  {property.reviewsCount ? (
                     <span className="text-muted fw-normal small">
                        ({property.reviewsCount})
                     </span>
                  ) : null}
               </div>
            </div>

            {/* Address */}
            <Card.Text className="text-muted small text-truncate mb-3">
               {property.address}
            </Card.Text>

            {/* Features Row */}
            <div className="d-flex align-items-center justify-content-between border-top border-bottom py-2 mb-3 text-muted small">
               <div className="d-flex align-items-center gap-1">
                  <FaBed size={15} className="text-secondary" />
                  <span>
                     {property.bedrooms || 0} {property.bedroomsText}
                  </span>
               </div>
               <div className="d-flex align-items-center gap-1">
                  <FaBath size={14} className="text-secondary" />
                  <span>
                     {property.bathrooms || 0} {property.bathroomsText}
                  </span>
               </div>
               {property.maxGuests && (
                  <div className="d-flex align-items-center gap-1">
                     <FaUserGroup size={14} className="text-secondary" />
                     <span>{property.maxGuests} Guests</span>
                  </div>
               )}
            </div>

            {/* Price & Action Button */}
            <div className="mt-auto d-flex align-items-center justify-content-between pt-1">
               <div>
                  <span className="fs-5 fw-bold text-dark">
                     {formatPrice(property.pricePerNight)}
                  </span>
                  <span className="text-muted small">
                     {" "}
                     / {property.pricePerNightText}
                  </span>
               </div>

               <Link
                  href={`/properties/${property.documentId || property.id}`}
                  passHref
               >
                  <Button
                     variant="dark"
                     size="sm"
                     className="rounded-3 px-3 fw-semibold"
                  >
                     View Details
                  </Button>
               </Link>
            </div>
         </Card.Body>
      </Card>
   );
};
