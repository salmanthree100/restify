"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface StrapiRichTextChild {
   type?: string;
   text?: string;
}

interface StrapiRichTextBlock {
   type?: string;
   children?: StrapiRichTextChild[];
}

type DescriptionType = string | StrapiRichTextBlock[] | null | undefined;

interface BookingDetail {
   documentId: string;
   checkIn: string;
   checkOut: string;
   guestsCount: number;
   totalPrice: number;
   bookingStatus: string;
   property?: {
      title: string;
      description?: DescriptionType;
      location?: string;
      guestsCount?: number;
      bedsCount?: number;
      bathsCount?: number;
      images?: { url: string }[];
      host?: { name?: string };
   };
}

export default function TripDetailsPage() {
   const params = useParams();
   const { token } = useAuth();
   const [trip, setTrip] = useState<BookingDetail | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const bookingId = params.id;

   useEffect(() => {
      if (!token || !bookingId) return;

      const fetchTripDetails = async () => {
         try {
            setLoading(true);
            const STRAPI_URL =
               process.env.NEXT_PUBLIC_STRAPI_API_URL ||
               "http://localhost:1337";

            const response = await fetch(
               `${STRAPI_URL}/api/bookings?filters[documentId][$eq]=${bookingId}&populate[property][populate][0]=images&populate[property][populate][1]=host`,
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               },
            );

            if (!response.ok) {
               throw new Error("Failed to load booking details.");
            }

            const data = await response.json();
            if (data.data && data.data.length > 0) {
               setTrip(data.data[0]);
            } else {
               setError("Trip not found.");
            }
         } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
         } finally {
            setLoading(false);
         }
      };

      fetchTripDetails();
   }, [token, bookingId]);

   const renderDescription = (desc: DescriptionType): string => {
      if (!desc) return "Cozy retreat ideal for your upcoming stay.";
      if (typeof desc === "string") return desc;

      if (Array.isArray(desc)) {
         return desc
            .map(
               (block: StrapiRichTextBlock) =>
                  block?.children
                     ?.map((child: StrapiRichTextChild) => child?.text || "")
                     .join("") || "",
            )
            .join(" ");
      }

      return "Cozy retreat ideal for your upcoming stay.";
   };

   if (loading) {
      return (
         <div className="container py-5 text-center min-vh-100 d-flex justify-content-center align-items-center">
            <div className="spinner-border text-primary" role="status" />
         </div>
      );
   }

   if (error || !trip) {
      return (
         <div className="container py-5 text-center">
            <p className="text-danger">{error || "Trip not found."}</p>
            <Link href="/dashboard/trips" className="btn btn-dark mt-3">
               Back to Trips
            </Link>
         </div>
      );
   }

   const property = trip.property;
   const imageUrl = property?.images?.[0]?.url
      ? property.images[0].url.startsWith("http")
         ? property.images[0].url
         : `${process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"}${property.images[0].url}`
      : "/images/placeholder.jpg";

   const nightsCount = Math.max(
      1,
      Math.round(
         (new Date(trip.checkOut).getTime() -
            new Date(trip.checkIn).getTime()) /
            (1000 * 60 * 60 * 24),
      ),
   );

   return (
      <div className="container-fluid bg-light min-vh-100 py-4">
         <div className="container" style={{ maxWidth: "1000px" }}>
            <div className="mb-4">
               <Link
                  href="/dashboard/trips"
                  className="text-decoration-none text-dark fw-bold d-inline-flex align-items-center gap-2"
               >
                  <i className="bi bi-arrow-left"></i> Back to Trips
               </Link>
            </div>

            <div className="bg-white rounded-4 border p-4 shadow-sm">
               <div className="row g-4 align-items-center pb-4 border-bottom">
                  <div className="col-md-4">
                     <div
                        className="position-relative rounded-3 overflow-hidden bg-light"
                        style={{ height: "160px" }}
                     >
                        <Image
                           src={imageUrl}
                           alt={property?.title || "Property"}
                           fill
                           className="object-fit-cover"
                           unoptimized
                        />
                     </div>
                  </div>
                  <div className="col-md-8">
                     <div className="d-flex justify-content-between align-items-start">
                        <div>
                           <h4 className="fw-bold mb-1">
                              {property?.title || "About this property"}
                           </h4>
                           <p className="text-muted small mb-2">
                              {property?.guestsCount || 5} guests • Cabin •{" "}
                              {property?.bedsCount || 2} Beds •{" "}
                              {property?.bathsCount || 2} Baths
                           </p>
                        </div>
                        {property?.host && (
                           <div className="text-end">
                              <small className="text-muted d-block">
                                 Hosted by
                              </small>
                              <span className="fw-bold small">
                                 {property.host.name || "Host"}
                              </span>
                           </div>
                        )}
                     </div>
                     <p className="text-secondary small mb-3">
                        {renderDescription(property?.description)}
                     </p>
                     <div className="d-flex align-items-center gap-2 flex-wrap">
                        <button className="btn btn-outline-dark btn-sm rounded-pill px-3">
                           <i className="bi bi-telephone me-1"></i> Call
                        </button>
                        <button className="btn btn-outline-dark btn-sm rounded-pill px-3">
                           <i className="bi bi-chat-dots me-1"></i> Message
                        </button>
                        <button className="btn btn-outline-dark btn-sm rounded-pill px-3">
                           <i className="bi bi-whatsapp me-1"></i> Whatsapp
                        </button>
                     </div>
                  </div>
               </div>

               <div className="row py-4 border-bottom g-4 align-items-center">
                  <div className="col-lg-8">
                     <div className="row g-3">
                        <div className="col-sm-6">
                           <div className="d-flex align-items-start gap-2">
                              <i className="bi bi-calendar-event fs-5 text-muted"></i>
                              <div>
                                 <span className="d-block text-dark fw-bold small">
                                    Date
                                 </span>
                                 <small className="text-secondary">
                                    {trip.checkIn} - {trip.checkOut}
                                 </small>
                              </div>
                           </div>
                        </div>
                        <div className="col-sm-6">
                           <div className="d-flex align-items-start gap-2">
                              <i className="bi bi-people fs-5 text-muted"></i>
                              <div>
                                 <span className="d-block text-dark fw-bold small">
                                    Guests
                                 </span>
                                 <small className="text-secondary">
                                    {trip.guestsCount} guests
                                 </small>
                              </div>
                           </div>
                        </div>
                        <div className="col-sm-6 mt-3">
                           <div className="d-flex align-items-start gap-2">
                              <i className="bi bi-moon-stars fs-5 text-muted"></i>
                              <div>
                                 <span className="d-block text-dark fw-bold small">
                                    Length of stay
                                 </span>
                                 <small className="text-secondary">
                                    {nightsCount} Nights
                                 </small>
                              </div>
                           </div>
                        </div>
                        <div className="col-sm-6 mt-3">
                           <div className="d-flex align-items-start gap-2">
                              <i className="bi bi-check-circle fs-5 text-success"></i>
                              <div>
                                 <span className="d-block text-dark fw-bold small">
                                    Status
                                 </span>
                                 <small className="text-success fw-semibold text-capitalize">
                                    {trip.bookingStatus}
                                 </small>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="col-lg-4">
                     <div className="bg-light rounded-3 p-3 text-center border h-100 d-flex flex-column justify-content-center align-items-center">
                        <i className="bi bi-geo-alt fs-4 text-danger mb-1"></i>
                        <small className="text-muted">
                           {property?.location || "Destination Location"}
                        </small>
                     </div>
                  </div>
               </div>

               {/* Price Breakdown & Actions */}
               <div className="row pt-4 align-items-center">
                  <div className="col-md-6">
                     <h6 className="fw-bold mb-3">Price Summary</h6>
                     {(() => {
                        const inclusiveTotal = trip.totalPrice || 0;
                        const baseAccommodation = Math.round(
                           inclusiveTotal / 1.1,
                        );
                        const vatAmount = inclusiveTotal - baseAccommodation;

                        return (
                           <>
                              <div className="d-flex justify-content-between mb-2 small text-secondary">
                                 <span>
                                    Accommodation ({nightsCount} nights)
                                 </span>
                                 <span>${baseAccommodation}</span>
                              </div>
                              <div className="d-flex justify-content-between mb-2 small text-secondary">
                                 <span>10% VAT</span>
                                 <span>${vatAmount}</span>
                              </div>
                              <div className="d-flex justify-content-between fw-bold fs-6 text-dark pt-2 border-top">
                                 <span>Total Price</span>
                                 <span>${inclusiveTotal}</span>
                              </div>
                           </>
                        );
                     })()}
                  </div>
                  <div className="col-md-6 text-md-end mt-4 mt-md-0 d-flex flex-column flex-sm-row justify-content-end gap-3">
                     <button className="btn btn-outline-danger btn-sm px-4 rounded-pill">
                        Cancel booking
                     </button>
                     <button className="btn btn-dark btn-sm px-4 rounded-pill">
                        Download invoice
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
