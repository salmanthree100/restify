"use client";

import Image from "next/image";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";

export interface Trip {
   documentId: string;
   checkIn: string;
   checkOut: string;
   totalPrice: number;
   guestsCount: number;
   bookingStatus: "pending" | "confirmed" | "cancelled";
   property: {
      documentId: string;
      title: string;
      locationName: string;
      images?: Array<{ url: string }>;
   };
}

interface TripCardProps {
   trip: Trip;
   onSelect: (trip: Trip) => void;
}

export default function TripCard({ trip, onSelect }: TripCardProps) {
   const getStatusBadge = (status: string) => {
      switch (status) {
         case "confirmed":
            return <Badge bg="success">Confirmed</Badge>;
         case "pending":
            return (
               <Badge bg="warning" text="dark">
                  Pending
               </Badge>
            );
         case "cancelled":
            return <Badge bg="danger">Cancelled</Badge>;
         default:
            return <Badge bg="secondary">{status}</Badge>;
      }
   };

   const imageUrl = trip.property?.images?.[0]?.url
      ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"}${trip.property.images[0].url}`
      : "/images/placeholder-property.jpg";

   return (
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between p-3 mb-3 bg-white border rounded-4 shadow-sm">
         <div className="d-flex align-items-center gap-3">
            <div
               style={{ width: "100px", height: "80px", position: "relative" }}
               className="flex-shrink-0 rounded-3 overflow-hidden"
            >
               <Image
                  src={imageUrl}
                  alt={trip.property?.title || "Property image"}
                  fill
                  className="object-fit-cover"
               />
            </div>
            <div>
               <div className="d-flex align-items-center gap-2 mb-1">
                  <h6 className="fw-bold mb-0">{trip.property?.title}</h6>
                  {getStatusBadge(trip.bookingStatus)}
               </div>
               <p className="text-muted small mb-1">
                  {trip.property?.locationName}
               </p>
               <span className="text-secondary small">
                  {new Date(trip.checkIn).toLocaleDateString()} –{" "}
                  {new Date(trip.checkOut).toLocaleDateString()} •{" "}
                  {trip.guestsCount} guests
               </span>
            </div>
         </div>

         <div className="d-flex align-items-center justify-content-between justify-content-md-end gap-4 mt-3 mt-md-0 border-top border-md-0 pt-2 pt-md-0">
            <div className="text-md-end">
               <span className="text-muted small d-block">Total Price</span>
               <strong className="fs-6">${trip.totalPrice}</strong>
            </div>
            <Button
               variant="outline-dark"
               size="sm"
               className="rounded-pill px-3"
               onClick={() => onSelect(trip)}
            >
               View Details
            </Button>
         </div>
      </div>
   );
}
