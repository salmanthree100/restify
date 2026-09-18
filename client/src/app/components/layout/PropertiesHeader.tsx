"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar, Container, Dropdown } from "react-bootstrap";
import { MdOutlineMenu } from "react-icons/md";
import { FaRegCircleUser } from "react-icons/fa6";
import { CiGlobe, CiSearch } from "react-icons/ci";
import { FiSearch, FiUsers } from "react-icons/fi";
import { PiMapPinLight } from "react-icons/pi";
import { HiCalendarDateRange } from "react-icons/hi2";

import DestinationPopover from "@/app/components/common/DestinationPopover";
import DatePicker from "@/app/components/common/DatePicker";
import GuestPopover, {
   GuestCounts,
} from "@/app/components/common/GuestPopover";
import LanguageCurrencyModal from "@/app/components/common/LanguageCurrencyModal";
import AuthModal from "@/app/components/auth/AuthModal";
import { useAuth } from "@/context/AuthContext";
import { DateRange } from "react-day-picker";
import { formatLocalDate } from "@/lib/utils";

interface SelectedDestinationData {
   title: string;
   description?: string;
   subtitle?: string;
   iconUrl?: string;
   iconBgColor?: string;
   lat?: number;
   lng?: number;
}

export default function ExpandableSearchHeader() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const { user, logout } = useAuth();

   const [isExpanded, setIsExpanded] = useState(false);
   const [showLangModal, setShowLangModal] = useState(false);
   const [showAuthModal, setShowAuthModal] = useState(false);

   // References
   const headerRef = useRef<HTMLDivElement>(null);
   const datePickerRef = useRef<HTMLDivElement>(null);

   // Extract URL Parameters for state initialization
   const paramDestination = searchParams.get("destination") || "";
   const paramCheckIn = searchParams.get("checkIn");
   const paramCheckOut = searchParams.get("checkOut");

   // Search State
   const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
   const [destinationInput, setDestinationInput] = useState(paramDestination);
   const [selectedDestination, setSelectedDestination] =
      useState<SelectedDestinationData | null>(null);
   const [isDestinationOpen, setIsDestinationOpen] = useState(false);

   const [dates, setDates] = useState<DateRange | undefined>(() => {
      if (paramCheckIn) {
         return {
            from: new Date(paramCheckIn),
            to: paramCheckOut ? new Date(paramCheckOut) : undefined,
         };
      }
      return undefined;
   });

   const [isGuestOpen, setIsGuestOpen] = useState(false);
   const [guestCounts, setGuestCounts] = useState<GuestCounts>(() => ({
      adults: parseInt(searchParams.get("adults") || "0", 10),
      children: parseInt(searchParams.get("children") || "0", 10),
      infants: parseInt(searchParams.get("infants") || "0", 10),
      pets: parseInt(searchParams.get("pets") || "0", 10),
   }));

   // Active URL params for compact display fallback
   const destinationParam = paramDestination || "Anywhere";
   const checkIn = paramCheckIn;
   const checkOut = paramCheckOut;
   const guestsParam = searchParams.get("guests") || searchParams.get("adults");

   const formatDateRangePill = () => {
      if (!checkIn) return "Any week";
      const start = new Date(checkIn);
      if (isNaN(start.getTime())) return "Any week";

      const startMonth = start.toLocaleDateString("en-US", { month: "short" });
      const startDate = start.getDate();

      if (checkOut) {
         const end = new Date(checkOut);
         if (!isNaN(end.getTime())) {
            return `${startMonth} ${startDate}–${end.getDate()}`;
         }
      }
      return `${startMonth} ${startDate}`;
   };

   // Helper utility to convert JavaScript Date objects into short readable strings
   const formatDisplayDates = (): string => {
      if (!dates?.from) return "Add dates";

      const options: Intl.DateTimeFormatOptions = {
         month: "short",
         day: "numeric",
      };
      const startStr = dates.from.toLocaleDateString("en-US", options);

      if (!dates.to) return `${startStr} - ...`;

      const endStr = dates.to.toLocaleDateString("en-US", options);
      return `${startStr} - ${endStr}`;
   };

   // Helper function to calculate guest description string
   const getGuestSummary = () => {
      const totalGuests =
         (guestCounts.adults || 0) + (guestCounts.children || 0);
      const infants = guestCounts.infants || 0;
      const pets = guestCounts.pets || 0;

      if (totalGuests === 0) return "Add guests";

      const parts = [
         `${totalGuests} ${totalGuests === 1 ? "guest" : "guests"}`,
      ];
      if (infants > 0)
         parts.push(`${infants} ${infants === 1 ? "infant" : "infants"}`);
      if (pets > 0) parts.push(`${pets} ${pets === 1 ? "pet" : "pets"}`);

      return parts.join(", ");
   };

   // Close expanded search bar when clicking outside header AND date picker popover
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         const target = event.target as Node;
         if (
            headerRef.current &&
            !headerRef.current.contains(target) &&
            datePickerRef.current &&
            !datePickerRef.current.contains(target)
         ) {
            setIsExpanded(false);
            setShowDatePicker(false);
            setIsDestinationOpen(false);
            setIsGuestOpen(false);
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   const handleSelectDestination = (dest: SelectedDestinationData) => {
      setDestinationInput(dest.title);
      setSelectedDestination(dest);
      setIsDestinationOpen(false);

      localStorage.setItem(
         "recent_search",
         JSON.stringify({
            title: dest.title,
            subtitle: dest.subtitle || "Recent search",
         }),
      );
   };

   // Search handler function
   const handleSearch = () => {
      const queryParams = new URLSearchParams();

      // 1. Destination
      if (selectedDestination?.title) {
         queryParams.set("destination", selectedDestination.title);
         if (selectedDestination.lat && selectedDestination.lng) {
            queryParams.set("lat", selectedDestination.lat.toString());
            queryParams.set("lng", selectedDestination.lng.toString());
         }
      } else if (destinationInput.trim()) {
         queryParams.set("destination", destinationInput.trim());
      }

      // 2. Dates
      if (dates?.from) {
         queryParams.set("checkIn", formatLocalDate(dates.from));
      }
      if (dates?.to) {
         queryParams.set("checkOut", formatLocalDate(dates.to));
      }

      // 3. Guests
      const totalGuests =
         (guestCounts.adults || 0) + (guestCounts.children || 0);
      if (totalGuests > 0) {
         queryParams.set("guests", totalGuests.toString());
      }
      if (guestCounts.adults > 0)
         queryParams.set("adults", guestCounts.adults.toString());
      if (guestCounts.children > 0)
         queryParams.set("children", guestCounts.children.toString());
      if (guestCounts.infants > 0)
         queryParams.set("infants", guestCounts.infants.toString());
      if (guestCounts.pets > 0)
         queryParams.set("pets", guestCounts.pets.toString());

      setIsExpanded(false);
      setShowDatePicker(false);
      router.push(`/properties?${queryParams.toString()}`);
   };

   return (
      <>
         <header
            ref={headerRef}
            className="bg-white border-bottom sticky-top shadow-sm transition-all position-relative"
            style={{ zIndex: 1030 }} // Ensures the entire header overlays map components
         >
            <Navbar bg="white" expand="lg" className="py-2">
               <Container
                  fluid
                  className="px-lg-5 px-3 d-flex align-items-center justify-content-between"
               >
                  {/* 1. Logo */}
                  <Navbar.Brand as={Link} href="/" className="m-0">
                     <Image
                        src="/logo.png"
                        alt="Restify Logo"
                        width={120}
                        height={36}
                        priority
                        className="object-fit-contain"
                     />
                  </Navbar.Brand>

                  {/* 2. Compact Search Pill */}
                  {!isExpanded && (
                     <div
                        onClick={() => setIsExpanded(true)}
                        role="button"
                        tabIndex={0}
                        className="d-flex align-items-center border rounded-pill shadow-sm px-3 py-1 cursor-pointer bg-white"
                        style={{ maxWidth: "500px", width: "100%" }}
                     >
                        <div className="d-flex align-items-center flex-grow-1 px-2 border-end text-truncate">
                           <span className="fw-semibold text-dark text-truncate small">
                              {destinationParam}
                           </span>
                        </div>

                        <div className="d-flex align-items-center flex-grow-1 px-2 border-end text-truncate d-none d-sm-flex">
                           <span className="fw-semibold text-dark text-truncate small">
                              {formatDateRangePill()}
                           </span>
                        </div>

                        <div className="d-flex align-items-center flex-grow-1 px-2 text-truncate d-none d-md-flex">
                           <span className="fw-normal text-muted text-truncate small">
                              {guestsParam
                                 ? `${guestsParam} Guests`
                                 : "Add guests"}
                           </span>
                        </div>

                        <div
                           className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ms-2"
                           style={{ width: "32px", height: "32px" }}
                        >
                           <CiSearch size={18} />
                        </div>
                     </div>
                  )}

                  {/* 3. Navigation Controls */}
                  <div className="d-flex align-items-center gap-2">
                     <button
                        type="button"
                        onClick={() => setShowLangModal(true)}
                        className="btn btn-light rounded-circle p-2 border-0 text-dark"
                        style={{ width: "40px", height: "40px" }}
                     >
                        <CiGlobe size={20} />
                     </button>

                     <Dropdown align="end">
                        <Dropdown.Toggle
                           variant="outline-secondary"
                           id="user-menu-dropdown"
                           className="rounded-pill d-flex align-items-center gap-2 px-3 py-1 bg-white border text-dark shadow-sm"
                        >
                           <MdOutlineMenu size={20} />
                           <FaRegCircleUser size={20} />
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="shadow-lg border-0 rounded-4 mt-2 py-2">
                           {user ? (
                              <>
                                 <Dropdown.Item
                                    as={Link}
                                    href="/profile"
                                    className="py-2 fw-semibold"
                                 >
                                    Profile
                                 </Dropdown.Item>
                                 <Dropdown.Divider />
                                 <Dropdown.Item
                                    onClick={logout}
                                    className="py-2 text-danger"
                                 >
                                    Log out
                                 </Dropdown.Item>
                              </>
                           ) : (
                              <Dropdown.Item
                                 onClick={() => setShowAuthModal(true)}
                                 className="py-2 fw-semibold"
                              >
                                 Log in / Sign up
                              </Dropdown.Item>
                           )}
                        </Dropdown.Menu>
                     </Dropdown>
                  </div>
               </Container>
            </Navbar>

            {/* 4. Expanded Search Bar Container */}
            {isExpanded && (
               <div className="pb-4 pt-2 px-3 border-top bg-white">
                  <div
                     className="d-flex justify-content-center my-2 position-relative w-100 mx-auto"
                     style={{ maxWidth: "850px" }}
                  >
                     <div className="bg-white rounded-pill p-2 border shadow-lg d-flex align-items-center gap-3 w-100">
                        {/* Destination Column */}
                        <div
                           className="flex-grow-1 px-4 border-end cursor-pointer"
                           onClick={() => {
                              setIsGuestOpen(false);
                              setShowDatePicker(false);
                              setIsDestinationOpen(true);
                           }}
                        >
                           <div className="extra-small fw-semibold text-muted">
                              <PiMapPinLight
                                 size={20}
                                 className="me-2"
                                 color="#0C0C0C"
                              />
                              Where
                           </div>
                           <input
                              type="text"
                              value={destinationInput}
                              onChange={(e) => {
                                 setDestinationInput(e.target.value);
                                 if (selectedDestination) {
                                    setSelectedDestination(null);
                                 }
                                 setIsDestinationOpen(true);
                              }}
                              onFocus={() => setIsDestinationOpen(true)}
                              placeholder="Search destinations"
                              className="form-control border-0 bg-transparent p-0 shadow-none text-dark fw-medium"
                           />
                           <DestinationPopover
                              isOpen={isDestinationOpen}
                              onClose={() => setIsDestinationOpen(false)}
                              onSelectDestination={handleSelectDestination}
                              searchQuery={destinationInput}
                           />
                        </div>

                        {/* Date Column */}
                        <div
                           className="flex-grow-1 px-3 border-end cursor-pointer"
                           onClick={() => {
                              setIsDestinationOpen(false);
                              setIsGuestOpen(false);
                              setShowDatePicker((prev) => !prev);
                           }}
                        >
                           <div className="extra-small fw-semibold text-muted">
                              <HiCalendarDateRange
                                 size={20}
                                 className="me-2"
                                 color="#0C0C0C"
                              />
                              Dates
                           </div>
                           <span
                              className={
                                 dates?.from
                                    ? "text-dark small fw-semibold"
                                    : "text-secondary small"
                              }
                           >
                              {formatDisplayDates()}
                           </span>
                        </div>

                        {/* Guests Column */}
                        <div className="flex-grow-1 px-3">
                           <div className="extra-small fw-semibold text-muted">
                              <FiUsers
                                 size={20}
                                 className="me-2"
                                 color="#0C0C0C"
                              />
                              Who
                           </div>
                           <div className="position-relative">
                              <div
                                 onClick={() => {
                                    setIsDestinationOpen(false);
                                    setShowDatePicker(false);
                                    setIsGuestOpen(!isGuestOpen);
                                 }}
                                 className="cursor-pointer"
                              >
                                 <div className="text-secondary small">
                                    {getGuestSummary()}
                                 </div>
                              </div>

                              <GuestPopover
                                 isOpen={isGuestOpen}
                                 onClose={() => setIsGuestOpen(false)}
                                 guestCounts={guestCounts}
                                 onChangeCounts={setGuestCounts}
                              />
                           </div>
                        </div>

                        {/* Search Action Button */}
                        <button
                           onClick={handleSearch}
                           className="btn btn-dark rounded-circle p-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        >
                           <FiSearch color="#fff" size={20} />
                        </button>
                     </div>

                     {/* Inline Popover Positioned Absolute under Search Bar */}
                     {showDatePicker && (
                        <div
                           ref={datePickerRef}
                           onClick={(e) => e.stopPropagation()}
                           className="position-absolute bg-white rounded-4 shadow-lg border p-4"
                           style={{
                              top: "100%",
                              left: "50%",
                              transform: "translateX(-50%)",
                              marginTop: "12px",
                              zIndex: 1050,
                              width: "max-content", // Allows the container to expand naturally to fit two months side-by-side
                              maxWidth: "90vw", // Prevents overflow on smaller screen sizes
                           }}
                        >
                           <DatePicker
                              onDateChange={(range) => setDates(range)}
                           />
                        </div>
                     )}
                  </div>
               </div>
            )}
         </header>

         {/* Language & Currency Modal */}
         <LanguageCurrencyModal
            show={showLangModal}
            onHide={() => setShowLangModal(false)}
         />

         {/* Authentication Modal */}
         <AuthModal
            show={showAuthModal}
            onHide={() => setShowAuthModal(false)}
         />
      </>
   );
}
