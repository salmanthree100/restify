"use client";

import { useState, useEffect } from "react";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import { use } from "react";
import { Property } from "@/app/types";
import HeroSlider from "@/app/components/pages/properties/properties-details/HeroSlider";
import PropertyDescription from "@/app/components/pages/properties/properties-details/PropertyDescription";
import AmenitiesList from "@/app/components/pages/properties/properties-details/AmenitiesList";
import SelectDates from "@/app/components/pages/properties/properties-details/SelectDates";
import GuestReviews from "@/app/components/pages/properties/properties-details/GuestReviews";
import PoliciesSection from "@/app/components/pages/properties/properties-details/PoliciesSection";
import LocationSection from "@/app/components/pages/properties/properties-details/LocationSection";
import HostSection from "@/app/components/pages/properties/properties-details/HostSection";
import BookingWidget from "@/app/components/pages/properties/properties-details/BookingWidget";
import { Col, Container, Row } from "react-bootstrap";
import { useSearch } from "@/context/SearchContext";

const PropertiesDetailsPage = ({
   params,
}: {
   params: Promise<{ slug: string }>;
}) => {
   const { slug } = use(params);
   const { locale } = useLocale();
   const [propertiesDetails, setPropertiesDetails] = useState<Property | null>(
      null,
   );
   const [isLoading, setIsLoading] = useState(true);
   const { dates, guestCounts } = useSearch();

   useEffect(() => {
      async function fetchProperties() {
         setIsLoading(true);

         // 1. Build the query object
         const propertyDetailsQuery = qs.stringify(
            {
               locale: locale,
               filters: {
                  documentId: {
                     $eq: slug,
                  },
               },
               populate: {
                  // Single and multiple media fields
                  images: {
                     populate: "*",
                  },

                  // Components
                  propertyPolicies: {
                     populate: "*",
                  },
                  categorizedPhotos: {
                     populate: {
                        images: {
                           populate: "*",
                        },
                     },
                  },
                  reviewsSection: {
                     populate: "*",
                  },

                  // Relations
                  amenities: {
                     populate: "*",
                  },
                  host: {
                     populate: {
                        avatar: {
                           populate: "*",
                        },
                        hostInfo: true,
                        otherHosts: {
                           populate: "*",
                        },
                     },
                  },
                  reviews: {
                     populate: {
                        reviewerAvatar: {
                           populate: "*", // Populates review author details if applicable
                        },
                     },
                  },
                  bookings: {
                     fields: ["checkIn", "checkOut"], // Fetch only date ranges for datepicker availability
                  },
               },
            },
            {
               encodeValuesOnly: true, // Output clean, readable query strings
            },
         );

         const baseUrl =
            process.env.NEXT_PUBLIC_STRAPI_CLOUD_URL ||
            process.env.NEXT_PUBLIC_STRAPI_LOCAL_URL ||
            "http://localhost:1337";

         try {
            const res = await fetch(
               `${baseUrl}/api/properties?${propertyDetailsQuery}`,
            );
            const json = await res.json();
            console.log(json?.data?.[0]);
            setPropertiesDetails(json?.data?.[0] || []);
         } catch (error) {
            console.error("Error loading properties details data:", error);
         } finally {
            setIsLoading(false);
         }
      }

      fetchProperties();
   }, [slug, locale]);

   return (
      <div>
         {!isLoading && (
            <div>
               <HeroSlider
                  categorizedPhotos={propertiesDetails?.categorizedPhotos || []}
               />
               <Container>
                  <Row>
                     <Col lg={8}>
                        <PropertyDescription
                           description={propertiesDetails?.description || []}
                           title={propertiesDetails?.title}
                           rating={propertiesDetails?.rating}
                           reviewsCount={propertiesDetails?.reviewsCount}
                           bedrooms={propertiesDetails?.bedrooms}
                           bathrooms={propertiesDetails?.bathrooms}
                           maxGuests={propertiesDetails?.maxGuests}
                           propertyType={propertiesDetails?.propertyType}
                           bedroomsText={propertiesDetails?.bedroomsText}
                           bathroomsText={propertiesDetails?.bathroomsText}
                        />
                     </Col>
                     <Col lg={4}>
                        <BookingWidget
                           pricePerNight={
                              propertiesDetails?.pricePerNight || 250
                           }
                           extraGuestFee={
                              propertiesDetails?.extraGuestFee || 25
                           }
                           maxGuests={propertiesDetails?.maxGuests || 3}
                           selectedDates={dates}
                           guestCounts={guestCounts}
                           title={propertiesDetails?.title || ""}
                           locationName={propertiesDetails?.locationName || ""}
                           rating={propertiesDetails?.rating || 4.9}
                           images={propertiesDetails?.images || []}
                        />
                     </Col>
                  </Row>
               </Container>
               <AmenitiesList amenities={propertiesDetails?.amenities} />
               <SelectDates />
               <GuestReviews
                  reviewsSection={propertiesDetails?.reviewsSection}
                  reviews={propertiesDetails?.reviews}
                  rating={propertiesDetails?.rating}
                  reviewsCount={propertiesDetails?.reviewsCount}
               />
               <PoliciesSection
                  propertyPolicies={propertiesDetails?.propertyPolicies}
               />
               <LocationSection
                  locationText={propertiesDetails?.locationName}
                  latitude={propertiesDetails?.latitude}
                  longitude={propertiesDetails?.longitude}
                  title={propertiesDetails?.title}
               />
               <HostSection host={propertiesDetails?.host} />
            </div>
         )}
      </div>
   );
};

export default PropertiesDetailsPage;
