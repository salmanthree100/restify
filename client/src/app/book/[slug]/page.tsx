"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Container, Row, Col, Alert } from "react-bootstrap";
import { useSearch } from "@/context/SearchContext";
import { useAuth } from "@/context/AuthContext";
import BookingSummaryCard from "@/app/components/pages/book/BookingSummaryCard";
import PaymentScheduleStep from "@/app/components/pages/book/PaymentScheduleStep";
import PaymentMethodStep, {
   PaymentDetails,
} from "@/app/components/pages/book/PaymentMethodStep";
import HostMessageStep from "@/app/components/pages/book/HostMessageStep";
import ReviewRequestStep from "@/app/components/pages/book/ReviewRequestStep";
import { Property, StrapiImage } from "@/app/types";

interface PropertyDetails {
   id?: number | string;
   documentId?: string;
   title: string;
   locationName: string;
   rating: number;
   pricePerNight: number;
   images: StrapiImage[];
   totalPrice: number;
   nights: number;
}

const DEFAULT_PROPERTY: PropertyDetails = {
   title: "",
   locationName: "",
   rating: 1,
   pricePerNight: 200,
   images: [],
   totalPrice: 100,
   nights: 1,
};

export default function BookingPage() {
   const params = useParams();
   // Get property document ID directly from URL dynamic route parameter [slug]
   const routePropertyId = (params?.slug as string) || "";

   const { dates, guestCounts } = useSearch();
   const { token } = useAuth();
   const [activeStep, setActiveStep] = useState<number>(1);

   const [paymentSchedule, setPaymentSchedule] = useState<"full" | "part">(
      "full",
   );
   const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
      null,
   );
   const [hostMessage, setHostMessage] = useState<string>("");
   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
   const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
   const [errorMessage, setErrorMessage] = useState<string>("");

   const [property] = useState<PropertyDetails>(() => {
      if (typeof window === "undefined") return DEFAULT_PROPERTY;

      try {
         const data = sessionStorage.getItem("booking_data");
         if (data) {
            const parsed = JSON.parse(data);
            return {
               id: parsed.propertyId || parsed.id,
               documentId: parsed.propertyDocumentId || parsed.documentId,
               title: parsed.propertyTitle || "",
               locationName: parsed.propertyLocation || "",
               rating: parsed.propertyRating || 5,
               pricePerNight: parsed.pricePerNight || 0,
               images: parsed.images || [],
               totalPrice: parsed.totalPrice || 0,
               nights: parsed.nights || 1,
            };
         }
      } catch {
         // Omitted error parameter
      }

      return DEFAULT_PROPERTY;
   });

   const handleBookingSubmit = async () => {
      // 1. Guard against unauthenticated state before attempting payment
      if (!token) {
         setErrorMessage("Your session has expired. Please log in again.");
         setStatus("error");
         return;
      }

      if (!paymentDetails?.paymentMethodId) {
         setErrorMessage("Payment method missing. Please complete step 2.");
         setStatus("error");
         return;
      }

      // Resolve Property ID: prefer documentId/id from session, fallback to route param
      const targetPropertyId =
         property.documentId || property.id || routePropertyId;

      if (!targetPropertyId) {
         setErrorMessage(
            "Property ID is missing. Please reload and select a property.",
         );
         setStatus("error");
         return;
      }

      setIsSubmitting(true);
      setStatus("idle");

      try {
         const STRAPI_URL =
            process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

         const response = await fetch(`${STRAPI_URL}/api/bookings`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
               data: {
                  property: targetPropertyId,
                  checkIn: dates?.from
                     ? new Date(dates.from).toISOString()
                     : new Date().toISOString(),
                  checkOut: dates?.to
                     ? new Date(dates.to).toISOString()
                     : new Date(Date.now() + 86400000).toISOString(),
                  guestsCount:
                     (guestCounts?.adults || 1) + (guestCounts?.children || 0),
                  totalPrice: property.totalPrice,
                  paymentMethodId: paymentDetails.paymentMethodId,
                  paymentSchedule,
                  hostMessage,
               },
            }),
         });

         if (!response.ok) {
            const errData = await response.json();

            // Safely extract message without triggering global error listeners
            const serverMessage =
               errData?.error?.message ||
               "Payment processing failed. Please check your card details.";

            throw new Error(serverMessage);
         }

         setIsSubmitting(false);
         setStatus("success");
      } catch (err: unknown) {
         setIsSubmitting(false);
         setStatus("error");
         setErrorMessage(
            err instanceof Error
               ? err.message
               : "An error occurred during booking.",
         );
      }
   };

   if (status === "success") {
      return (
         <section style={{ margin: "100px 0" }}>
            <Container className="py-5 text-center">
               <div className="p-5 border rounded-4 bg-white shadow-sm max-w-lg mx-auto">
                  <h3 className="fw-bold text-success mb-3">
                     You&apos;re all set! Getting ready for your trip.
                  </h3>
                  <p className="text-muted mb-4">
                     A confirmation email with your reservation details has been
                     sent.
                  </p>
               </div>
            </Container>
         </section>
      );
   }

   return (
      <section style={{ margin: "100px 0" }}>
         <Container className="py-5">
            <h2 className="fw-bold mb-4">Request to book</h2>

            {status === "error" && (
               <Alert variant="danger" className="mb-4">
                  {errorMessage}
               </Alert>
            )}

            <Row className="g-5">
               <Col lg={7}>
                  <div className="border-bottom pb-3">
                     <PaymentScheduleStep
                        onNext={(schedule) => {
                           setPaymentSchedule(schedule);
                           setActiveStep(2);
                        }}
                     />
                  </div>

                  {activeStep >= 2 && (
                     <div className="border-bottom pb-3">
                        <PaymentMethodStep
                           onNext={(details) => {
                              setPaymentDetails(details);
                              setActiveStep(3);
                           }}
                        />
                     </div>
                  )}

                  {activeStep >= 3 && (
                     <div className="border-bottom pb-3">
                        <HostMessageStep
                           onNext={(msg) => {
                              setHostMessage(msg);
                              setActiveStep(4);
                           }}
                        />
                     </div>
                  )}

                  {activeStep >= 4 && (
                     <div>
                        <ReviewRequestStep
                           isSubmitting={isSubmitting}
                           onConfirm={handleBookingSubmit}
                        />
                     </div>
                  )}
               </Col>

               <Col lg={5}>
                  <BookingSummaryCard
                     property={property as unknown as Property}
                     checkIn={
                        dates?.from
                           ? dates.from.toLocaleDateString()
                           : "16/09/2026"
                     }
                     checkOut={
                        dates?.to ? dates.to.toLocaleDateString() : "18/09/2026"
                     }
                     guests={guestCounts}
                     totalNights={property.nights}
                     totalPrice={property.totalPrice}
                  />
               </Col>
            </Row>
         </Container>
      </section>
   );
}
