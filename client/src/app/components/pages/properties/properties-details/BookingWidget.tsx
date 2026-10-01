"use client";

import React, { useMemo } from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import { DateRange } from "react-day-picker";
import { differenceInCalendarDays, format } from "date-fns";
import { FaRegCalendarAlt } from "react-icons/fa";

export interface GuestCounts {
   [key: string]: number;
   adults: number;
   children: number;
   infants: number;
   pets: number;
}

export interface BookingWidgetProps {
   pricePerNight: number; // e.g., 225
   extraGuestFee?: number; // e.g., 25
   baseGuestCapacity?: number; // base guest count included in price, default 5
   maxGuests: number; // total capacity, e.g., 8
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
   pricePerNight,
   extraGuestFee = 25,
   baseGuestCapacity = 5,
   maxGuests = 8,
   selectedDates,
   guestCounts,
   onReserve,
}) => {
   // Calculate total nights selected
   const nights = useMemo(() => {
      if (selectedDates?.from && selectedDates?.to) {
         return Math.max(
            1,
            differenceInCalendarDays(selectedDates.to, selectedDates.from),
         );
      }
      return 1;
   }, [selectedDates]);

   // Calculate guests count
   const currentGuests =
      (guestCounts.adults || 1) + (guestCounts.children || 0);
   const extraGuests = Math.max(0, currentGuests - baseGuestCapacity);

   // Pricing calculation
   const totalExtraGuestFeePerNight = extraGuests * extraGuestFee;
   const effectivePricePerNight = pricePerNight + totalExtraGuestFeePerNight;
   const totalPrice = effectivePricePerNight * nights;

   // Formatted date strings (DD/MM/YYYY format as in screenshot)
   const checkInText = selectedDates?.from
      ? format(selectedDates.from, "dd/MM/yyyy")
      : "16/09/2026";
   const checkOutText = selectedDates?.to
      ? format(selectedDates.to, "dd/MM/yyyy")
      : "18/09/2026";

   const handleReserve = () => {
      if (onReserve) {
         onReserve({
            checkIn: selectedDates?.from,
            checkOut: selectedDates?.to,
            guests: guestCounts,
            totalPrice,
         });
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
               {/* Check-in & Check-out Display */}
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

               {/* Guest Selection Dropdown */}
               <div className="pt-3">
                  <span className="d-block">Guests</span>
                  <span>
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
                     CAD {pricePerNight}
                  </span>
               </div>

               <div className="d-flex justify-content-between mb-3 text-secondary small">
                  <span>For each additional person</span>
                  <span className="fw-semibold text-dark">
                     CAD {extraGuestFee}
                  </span>
               </div>
            </div>

            <hr className="my-3 text-muted" />

            {/* Total Price Section */}
            <div className="d-flex justify-content-between align-items-baseline mb-4">
               <span className="fw-bold text-dark fs-6">Total Price</span>
               <div className="text-end">
                  <span className="fw-bold text-dark fs-4 me-1">
                     ${totalPrice} CAD
                  </span>
                  <span className="text-muted small">
                     for {nights} {nights === 1 ? "night" : "nights"}
                  </span>
               </div>
            </div>

            {/* Reserve Button */}
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
      </Card>
   );
};

export default BookingWidget;
