"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext"; // Adjust import path
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import qs from "qs";
import { getStrapiMedia } from "@/lib/utils";
import Image from "next/image";

interface FeatureIcon {
   id: number;
   documentId?: string;
   name?: string;
   url: string;
   alternativeText: string | null;
   width: number;
   height: number;
}

interface FeatureCard {
   id: number;
   title: string;
   description: string;
   icon: FeatureIcon | null;
}

interface JourneyData {
   title: string;
   highlightedWord: string;
   subtitle: string;
   features: FeatureCard[];
}

export default function JourneySection() {
   const { locale } = useLocale(); // Access locale from context
   const [journey, setJourney] = useState<JourneyData | null>(null);
   const [loading, setLoading] = useState<boolean>(true);

   useEffect(() => {
      async function fetchJourneyData() {
         setLoading(true);

         const query = qs.stringify(
            {
               populate: {
                  journey: {
                     populate: {
                        features: {
                           populate: ["icon"],
                        },
                     },
                  },
               },
               locale,
            },
            { encodeValuesOnly: true },
         );

         try {
            const res = await fetch(`/api/strapi/home-page?${query}`);
            if (!res.ok) throw new Error("Failed to fetch data");

            const result = await res.json();
            console.log(result?.data?.journey);
            setJourney(result?.data?.journey || null);
         } catch (error) {
            console.error("Error fetching journey section:", error);
         } finally {
            setLoading(false);
         }
      }

      fetchJourneyData();
   }, [locale]); // Triggers refetch on locale change

   if (loading) {
      return (
         <section className="py-5 bg-white text-center">
            <Spinner animation="border" variant="danger" />
         </section>
      );
   }

   if (!journey) return null;

   // Split title safely around the highlighted word
   const titleParts = journey.title
      ? journey.title.split(journey.highlightedWord)
      : [];

   return (
      <section className="py-5 bg-white">
         <Container className="text-center">
            {/* Dynamic Title */}
            <h2 className="fw-bold mb-2 text-dark fs-1 text-capitalize">
               {titleParts[0]}
               {journey.highlightedWord && (
                  <span className="primary-text">
                     {journey.highlightedWord}
                  </span>
               )}
               {titleParts[1]}
            </h2>

            {/* Subtitle */}
            <p
               className="text-secondary mb-5 mx-auto fs-5"
               style={{ maxWidth: "600px" }}
            >
               {journey.subtitle}
            </p>

            {/* Cards Grid */}
            <Row className="g-4 justify-content-center">
               {journey.features?.map((feature) => {
                  const iconUrl = feature.icon?.url
                     ? getStrapiMedia(feature.icon?.url)
                     : null;

                  return (
                     <Col key={feature.id} xs={12} md={4}>
                        <Card className="h-100 border rounded-4 p-4 text-center shadow-sm">
                           <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                              {iconUrl && (
                                 <div className="mb-4">
                                    <Image
                                       src={iconUrl}
                                       alt={
                                          feature?.icon?.name || feature.title
                                       }
                                       style={{ width: "100%", height: "100%" }}
                                       width={feature?.icon?.width}
                                       height={feature?.icon?.height}
                                    />
                                 </div>
                              )}
                              <Card.Title className="fw-bold text-dark fs-4 mb-3 text-capitalize">
                                 {feature.title}
                              </Card.Title>
                              <Card.Text className="text-muted fs-6 mb-0">
                                 {feature.description}
                              </Card.Text>
                           </Card.Body>
                        </Card>
                     </Col>
                  );
               })}
            </Row>
         </Container>
      </section>
   );
}
