"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HeroSection.module.css";
import qs from "qs";
import { getStrapiMedia } from "@/lib/utils";
import { HeroSectionData } from "@/app/types";
import { useLocale } from "@/context/LocaleContext";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FiSearch, FiUsers } from "react-icons/fi";
import { PiMapPinLine, PiStarFour, PiMapPinLight } from "react-icons/pi";
import { HiCalendarDateRange } from "react-icons/hi2";
import DatePicker from "@/app/components/common/DatePicker";
import { Overlay } from "react-bootstrap";
import { DateRange } from "react-day-picker";
import DestinationPopover from "@/app/components/common/DestinationPopover";
import GuestPopover, {
   GuestCounts,
} from "@/app/components/common/GuestPopover";

interface SelectedDestinationData {
   title: string;
   description?: string;
   subtitle?: string;
   iconUrl?: string;
   iconBgColor?: string;
   lat?: number;
   lng?: number;
}

const HeroSection = () => {
   const [heroData, setHeroData] = useState<HeroSectionData | null>(null);
   const { locale } = useLocale();
   const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
   // 1. Create a reference attached to the entire search bar container
   const searchBarRef = useRef<HTMLDivElement>(null);
   const [dates, setDates] = useState<DateRange | undefined>(undefined);
   const [selectedDestination, setSelectedDestination] =
      useState<SelectedDestinationData | null>(null);
   const [isDestinationOpen, setIsDestinationOpen] = useState(false);
   const [destinationInput, setDestinationInput] = useState("");
   const [isGuestOpen, setIsGuestOpen] = useState(false);
   const [guestCounts, setGuestCounts] = useState<GuestCounts>({
      adults: 0,
      children: 0,
      infants: 0,
      pets: 0,
   });

   const handleSelectDestination = (dest: SelectedDestinationData) => {
      // 1. Fill input text with the selected title
      setDestinationInput(dest.title);

      // 2. Save full object data (coordinates, title, etc.)
      setSelectedDestination(dest);

      // 3. Close popover
      setIsDestinationOpen(false);

      // Optional: Save to recent search in localStorage
      localStorage.setItem(
         "recent_search",
         JSON.stringify({
            title: dest.title,
            subtitle: dest.subtitle || "Recent search",
         }),
      );
   };

   const query = qs.stringify(
      {
         locale,
         populate: {
            hero: {
               on: {
                  "blocks.hero-section": {
                     populate: {
                        backgroundImage: true,
                        stats: true,
                     },
                  },
               },
            },
         },
      },
      { encodeValuesOnly: true },
   );

   useEffect(() => {
      const fetchHeroData = async () => {
         const response = await fetch(`/api/strapi/home-page?${query}`);
         const data = await response.json();
         console.log(data?.data?.hero?.[0]);
         setHeroData(data?.data?.hero?.[0]);
      };
      fetchHeroData();
   }, [query]);

   const bgUrl = heroData?.backgroundImage?.url
      ? getStrapiMedia(heroData.backgroundImage.url)
      : null;

   // Helper utility function to turn JavaScript Date objects into short readable text strings
   const formatDisplayDates = (): string => {
      if (!dates?.from) return heroData?.datePlaceholder || "Add dates";

      const options: Intl.DateTimeFormatOptions = {
         month: "short",
         day: "numeric",
      };
      const startStr = dates.from.toLocaleDateString("en-US", options);

      if (!dates.to) return `${startStr} - ...`; // User picked a starting day but hasn't picked an end day yet

      const endStr = dates.to.toLocaleDateString("en-US", options);
      return `${startStr} - ${endStr}`; // Output example: "Aug 12 - Aug 19"
   };

   // Helper function to format input display string
   const getGuestSummary = () => {
      const totalGuests =
         (guestCounts.adults || 0) + (guestCounts.children || 0);
      const infants = guestCounts.infants || 0;
      const pets = guestCounts.pets || 0;

      if (totalGuests === 0) return heroData?.guestsPlaceholder;

      const parts = [
         `${totalGuests} ${totalGuests === 1 ? "guest" : "guests"}`,
      ];
      if (infants > 0)
         parts.push(`${infants} ${infants === 1 ? "infant" : "infants"}`);
      if (pets > 0) parts.push(`${pets} ${pets === 1 ? "pet" : "pets"}`);

      return parts.join(", ");
   };

   return (
      <section
         className={styles.herobg}
         style={{ backgroundImage: `url(${bgUrl})` }}
      >
         <Container className={styles.container}>
            <Row className="justify-content-center">
               <Col lg={8}>
                  {/* Top Floating Pill: Destination & AI Search */}
                  <div className="d-flex justify-content-center my-3">
                     <div className="glass-pill d-flex align-items-center bg-white bg-opacity-75 backdrop-blur rounded-pill p-1 shadow-lg">
                        <button
                           className={`${styles.destinationLabel} btn btn-light rounded-pill px-4 py-2 fw-normal`}
                        >
                           <PiMapPinLine
                              className="me-2"
                              color="#D02D11"
                              size={20}
                           />
                           {heroData?.destinationSearchText}
                        </button>
                        <button className="btn btn-link text-dark text-decoration-none px-4 py-2 fw-medium">
                           <PiStarFour
                              className="me-2"
                              size={20}
                              color="#0C0C0C"
                           />
                           {heroData?.searchWithAiText}
                        </button>
                     </div>
                  </div>

                  {/* Main Glassmorphic Search Bar */}
                  <div
                     className="d-flex justify-content-center my-4 position-relative w-100 mx-auto"
                     style={{ maxWidth: "850px" }}
                  >
                     <div
                        className="glass-search bg-white bg-opacity-85 backdrop-blur rounded-pill p-2 shadow-lg d-flex align-items-center gap-3 w-100 max-w-3xl"
                        ref={
                           searchBarRef
                        } /* 2. Anchor target for the overlay */
                     >
                        {/* Destination Column */}
                        <div
                           className="flex-grow-1 px-4 border-end"
                           onClick={() => setIsDestinationOpen(true)}
                        >
                           <div className="extra-small fw-semibold text-muted">
                              <PiMapPinLight
                                 size={20}
                                 className="me-2"
                                 color="#0C0C0C"
                              />
                              {heroData?.destinationLabel}
                           </div>
                           <input
                              type="text"
                              value={destinationInput}
                              onChange={(e) => {
                                 setDestinationInput(e.target.value);

                                 // Reset full selected object if user custom-edits the query
                                 if (selectedDestination) {
                                    setSelectedDestination(null);
                                 }

                                 setIsDestinationOpen(true);
                              }}
                              onFocus={() => setIsDestinationOpen(true)}
                              placeholder={heroData?.destinationPlaceholder}
                              className="form-control border-0 bg-transparent p-0 shadow-none text-dark fw-medium"
                           />
                           {/* Floating Destination Popover */}
                           <DestinationPopover
                              isOpen={isDestinationOpen}
                              onClose={() => setIsDestinationOpen(false)}
                              onSelectDestination={handleSelectDestination}
                              searchQuery={destinationInput}
                           />
                        </div>

                        {/* Date Column */}
                        <div
                           className="flex-grow-1 px-3 border-end"
                           style={{ cursor: "pointer" }}
                           onClick={() => setShowDatePicker(!showDatePicker)}
                        >
                           <div className="extra-small fw-semibold text-muted">
                              <HiCalendarDateRange
                                 size={20}
                                 className="me-2"
                                 color="#0C0C0C"
                              />
                              {heroData?.dateLabel}
                           </div>
                           {/* Dynamically displays the selected date string format */}
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
                              {heroData?.guestsLabel}
                           </div>
                           <div className="position-relative">
                              {/* Trigger Input Field */}
                              <div
                                 onClick={() => setIsGuestOpen(!isGuestOpen)}
                                 className="cursor-pointer"
                              >
                                 <div className="text-secondary small">
                                    {getGuestSummary()}
                                 </div>
                              </div>

                              {/* Popover */}
                              <GuestPopover
                                 isOpen={isGuestOpen}
                                 onClose={() => setIsGuestOpen(false)}
                                 guestCounts={guestCounts}
                                 onChangeCounts={setGuestCounts}
                              />
                           </div>
                        </div>

                        {/* 3. Render the overlay targeting the entire search bar width */}
                        <Overlay
                           target={searchBarRef}
                           show={showDatePicker}
                           placement="bottom"
                           rootClose={true}
                           onHide={() => setShowDatePicker(false)}
                        >
                           {/* eslint-disable @typescript-eslint/no-unused-vars */}
                           {({
                              placement,
                              arrowProps,
                              show: _show,
                              popper,
                              hasDoneInitialMeasure,
                              ...props
                           }) => (
                              /* eslint-enable @typescript-eslint/no-unused-vars */
                              <div
                                 {...props}
                                 style={{
                                    ...props.style,
                                    zIndex: 1050,
                                    width: "100%",
                                    maxWidth: "850px",
                                    marginTop: "4px",
                                 }}
                              >
                                 <DatePicker
                                    onDateChange={(range) => setDates(range)}
                                 />
                              </div>
                           )}
                        </Overlay>

                        {/* Search Action Button */}
                        <button className="btn btn-dark rounded-circle p-3 d-flex align-items-center justify-content-center">
                           <FiSearch color="#fff" size={24} />
                        </button>
                     </div>
                  </div>

                  {/* Dynamic Bottom Stats Grid */}
                  {heroData?.stats && heroData.stats.length > 0 && (
                     <div className="d-flex justify-content-between gap-5 pb-4 text-white text-center">
                        {heroData.stats.map((stat) => (
                           <div key={stat.id}>
                              <div className="display-6 fw-bold">
                                 {stat.value}
                              </div>
                              <div className="small opacity-75">
                                 {stat.label}
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </Col>
            </Row>
         </Container>
      </section>
   );
};

export default HeroSection;
