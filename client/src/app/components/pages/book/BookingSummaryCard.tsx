"use client";

import { Card, Image } from "react-bootstrap";
import { Property } from "@/app/types";
import { GuestCounts } from "@/context/SearchContext";
import { useCurrency } from "@/context/CurrencyContext";
import { getStrapiMedia } from "@/lib/utils";

interface BookingSummaryCardProps {
   property: Property;
   checkIn: string;
   checkOut: string;
   guests: GuestCounts;
   totalNights: number;
   totalPrice: number;
}

export default function BookingSummaryCard({
   property,
   checkIn,
   checkOut,
   guests,
   totalNights,
   totalPrice,
}: BookingSummaryCardProps) {
   const { formatPrice } = useCurrency();
   const totalGuests = (guests.adults || 1) + (guests.children || 0);

   return (
      <Card className="border rounded-4 p-3 shadow-sm bg-white">
         <Card.Body className="p-2">
            {/* Property Header */}
            <div className="d-flex gap-3 mb-3">
               <Image
                  src={
                     getStrapiMedia(property.images?.[0]?.url) ||
                     "/placeholder.jpg"
                  }
                  alt={property.title}
                  width={80}
                  height={80}
                  className="rounded-3 object-fit-cover"
               />
               <div>
                  <h6 className="fw-bold mb-1">{property.title}</h6>
                  <p className="text-muted small mb-0">
                     {property.locationName}
                  </p>
                  <p className="text-muted small mb-0">★ {property.rating}</p>
               </div>
            </div>

            <hr />

            {/* Selected Booking Details */}
            <div className="mb-3">
               <div className="d-flex justify-content-between text-secondary small mb-1">
                  <span>Dates</span>
                  <span className="fw-semibold text-dark">
                     {checkIn} – {checkOut}
                  </span>
               </div>
               <div className="d-flex justify-content-between text-secondary small">
                  <span>Guests</span>
                  <span className="fw-semibold text-dark">
                     {totalGuests} {totalGuests === 1 ? "guest" : "guests"}
                  </span>
               </div>
            </div>

            <hr />

            {/* Pricing Breakdown */}
            <div className="mb-3">
               <h6 className="fw-bold small mb-2">Price details</h6>
               <div className="d-flex justify-content-between text-secondary small mb-1">
                  <span>
                     {formatPrice(property.pricePerNight)} x {totalNights}{" "}
                     nights
                  </span>
                  <span>
                     {formatPrice(property.pricePerNight * totalNights)}
                  </span>
               </div>
               <div className="d-flex justify-content-between text-secondary small mb-1">
                  <span>Taxes & fees</span>
                  <span>{formatPrice(60)}</span>
               </div>
            </div>

            <hr />

            {/* Total Price */}
            <div className="d-flex justify-content-between align-items-center fw-bold">
               <span>Total</span>
               <span className="fs-5">{formatPrice(totalPrice + 60)}</span>
            </div>
         </Card.Body>
      </Card>
   );
}
