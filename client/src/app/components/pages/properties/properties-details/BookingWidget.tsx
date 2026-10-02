"use client";

import React, { useMemo, useState } from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import { DateRange } from "react-day-picker";
import { differenceInCalendarDays, format } from "date-fns";
import { FaRegCalendarAlt } from "react-icons/fa";
import { useCurrency } from "@/context/CurrencyContext";
import AuthModal from "@/app/components/auth/AuthModal";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export interface GuestCounts {
   [key: string]: number;
   adults: number;
   children: number;
   infants: number;
   pets: number;
}

export interface BookingWidgetProps {
   pricePerNight: number;
   extraGuestFee?: number;
   baseGuestCapacity?: number;
   maxGuests: number;
   selectedDates?: DateRange;
   guestCounts: GuestCounts;
   onGuestCountChange?: (totalGuests: number) => void;
   onReserve?: (bookingData: {
      checkIn?: Date;
      checkOut?: Date;
      guests: GuestCounts;
      totalPrice: number;
   }) => void;
}

const BookingWidget: React.FC<BookingWidgetProps> = ({
   pricePerNight = 0,
   extraGuestFee = 0,
   baseGuestCapacity = 5,
   maxGuests,
   selectedDates,
   guestCounts,
   onReserve,
}) => {
   const [showAuthModal, setShowAuthModal] = useState(false);

   const router = useRouter();
   const pathname = usePathname();
   const slug = pathname.split("/").pop() || "";
   const { user } = useAuth();

   const nights = useMemo(() => {
      if (selectedDates?.from && selectedDates?.to) {
         return Math.max(
            1,
            differenceInCalendarDays(selectedDates.to, selectedDates.from),
         );
      }
      return 1;
   }, [selectedDates]);

   const currentGuests =
      (guestCounts.adults || 1) + (guestCounts.children || 0);
   const extraGuests = Math.max(0, currentGuests - baseGuestCapacity);
   const totalExtraGuestFeePerNight = extraGuestFee * extraGuests;
   const effectivePricePerNight = pricePerNight + totalExtraGuestFeePerNight;
   const totalPrice = effectivePricePerNight * nights;

   const { formatPrice } = useCurrency();

   const checkInText = selectedDates?.from
      ? format(selectedDates.from, "dd/MM/yyyy")
      : "16/09/2026";
   const checkOutText = selectedDates?.to
      ? format(selectedDates.to, "dd/MM/yyyy")
      : "18/09/2026";

   const navigateToBooking = () => {
      setShowAuthModal(false);
      router.push(`/book/${slug}`);
   };

   const handleReserve = () => {
      if (onReserve) {
         onReserve({
            checkIn: selectedDates?.from,
            checkOut: selectedDates?.to,
            guests: guestCounts,
            totalPrice,
         });
      }

      if (user) {
         navigateToBooking();
      } else {
         setShowAuthModal(true);
      }
   };

   return (
      <Card
         className="border rounded-4 p-3 shadow-sm bg-white"
         style={{ maxWidth: "400px" }}
      >
         <Card.Body className="p-2">
            {/* Date & Guest Input Box Container */}
            <div className="border rounded-4 p-3 bg-white mb-4">
               <Row className="g-2 pb-3 border-bottom text-center">
                  <Col xs={6} className="border-end pe-2">
                     <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                        <FaRegCalendarAlt className="text-muted" size={18} />
                        <span className="fw-bold text-dark small">
                           Check-in
                        </span>
                     </div>
                     <div className="text-secondary small">{checkInText}</div>
                  </Col>
                  <Col xs={6} className="ps-2">
                     <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                        <FaRegCalendarAlt className="text-muted" size={18} />
                        <span className="fw-bold text-dark small">
                           Check-out
                        </span>
                     </div>
                     <div className="text-secondary small">{checkOutText}</div>
                  </Col>
               </Row>

               <div className="pt-3">
                  <span className="d-block fw-bold text-dark small">
                     Guests
                  </span>
                  <span className="text-secondary small">
                     {currentGuests > 1
                        ? `${currentGuests} persons`
                        : `${currentGuests} person`}
                  </span>
               </div>
            </div>

            {/* Details Section */}
            <div className="mb-4">
               <h6 className="fw-bold text-dark mb-3">Details</h6>

               <div className="d-flex justify-content-between mb-2 text-secondary small">
                  <span>Capacity</span>
                  <span className="fw-semibold text-dark">
                     {maxGuests} person
                  </span>
               </div>

               <div className="d-flex justify-content-between mb-2 text-secondary small">
                  <span>For {baseGuestCapacity} persons (per night)</span>
                  <span className="fw-semibold text-dark">
                     {formatPrice(pricePerNight)}
                  </span>
               </div>

               <div className="d-flex justify-content-between mb-3 text-secondary small">
                  <span>For each additional person</span>
                  <span className="fw-semibold text-dark">
                     {formatPrice(extraGuestFee)}
                  </span>
               </div>
            </div>

            <hr className="my-3 text-muted" />

            {/* Total Price Section */}
            <div className="d-flex justify-content-between align-items-baseline mb-4">
               <span className="fw-bold text-dark fs-6">Total Price</span>
               <div className="text-end">
                  <span className="fw-bold text-dark fs-4 me-1">
                     {formatPrice(totalPrice)}
                  </span>
                  <span className="text-muted small">
                     for {nights} {nights === 1 ? "night" : "nights"}
                  </span>
               </div>
            </div>

            <Button
               variant="danger"
               size="lg"
               className="w-100 fw-bold py-2 rounded-3 shadow-none border-0"
               style={{ backgroundColor: "#E53935" }}
               onClick={handleReserve}
            >
               Reserve
            </Button>
         </Card.Body>

         <AuthModal
            show={showAuthModal}
            onHide={() => setShowAuthModal(false)}
            onSuccess={navigateToBooking}
         />
      </Card>
   );
};

export default BookingWidget;
