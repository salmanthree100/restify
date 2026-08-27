"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { getStrapiMedia } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import qs from "qs";
import ReactMarkdown from "react-markdown";

interface ExploreImage {
   id: number;
   documentId: string;
   url: string;
   alternativeText: string | null;
   width: number;
   height: number;
}

interface StatBadge {
   id: number;
   value: string;
   label: string;
}

interface ExploreWorldProps {
   mainTitle: string;
   highlightTitle: string;
   endTitle: string;
   description: string;
   buttonText: string;
   buttonLink: string;
   heroImage: ExploreImage | null;
   stats: StatBadge[];
}

const ExploreWorld = () => {
   const { locale } = useLocale();
   const [sectionData, setSectionData] = useState<ExploreWorldProps | null>(
      null,
   );
   const [loading, setLoading] = useState<boolean>(true);

   useEffect(() => {
      async function fetchSectionData() {
         setLoading(true);

         const query = qs.stringify(
            {
               locale,
               populate: {
                  exploreSections: {
                     on: {
                        "blocks.explore-world": {
                           populate: {
                              heroImage: { populate: "*" },
                              stats: { populate: "*" },
                           },
                        },
                     },
                  },
               },
            },
            { encodeValuesOnly: true },
         );

         try {
            const res = await fetch(`/api/strapi/home-page?${query}`);
            if (!res.ok) throw new Error("Failed to fetch data");

            const result = await res.json();
            const data = result?.data?.exploreSections?.[0] || null;
            setSectionData(data);
         } catch (error) {
            console.error("Error fetching explore world section:", error);
         } finally {
            setLoading(false);
         }
      }

      fetchSectionData();
   }, [locale]);

   if (loading) {
      return (
         <section className="py-5 bg-white text-center">
            <Spinner animation="border" variant="danger" />
         </section>
      );
   }

   if (!sectionData) return null;

   const heroImageUrl = sectionData.heroImage
      ? getStrapiMedia(sectionData.heroImage.url)
      : null;

   // Exact badge placement matching the design reference
   const badgePositions = [
      { top: "-15px", left: "-25px" }, // Badge 1 (350+ Hotels)
      { top: "-25px", right: "80px" }, // Badge 2 (700+ Apartments)
      { bottom: "20px", left: "-25px" }, // Badge 3 (5000+ Destinations)
   ];

   return (
      <section className="explore-world-section py-4 py-md-5 bg-white">
         <Container className="border rounded-5 p-3 p-sm-4 p-lg-5 shadow-sm">
            <Row className="align-items-center g-4 g-lg-5">
               {/* Left Column - Image with Overlapping Badges */}
               <Col lg={6}>
                  <div
                     className="position-relative mx-auto"
                     style={{ maxWidth: "612px" }}
                  >
                     {/* Main Image Container */}
                     <div
                        className="position-relative overflow-hidden w-100"
                        style={{ height: "496px" }}
                     >
                        {heroImageUrl ? (
                           <Image
                              src={heroImageUrl}
                              alt={
                                 sectionData.heroImage?.alternativeText ||
                                 "Explore the world traveler"
                              }
                              fill
                              className="object-fit-cover"
                              priority
                           />
                        ) : (
                           <div className="w-100 h-100 bg-secondary" />
                        )}
                     </div>

                     {/* Overlapping Dynamic Badges */}
                     {sectionData.stats?.map((stat, idx) => {
                        const positionStyle =
                           badgePositions[idx % badgePositions.length];

                        return (
                           <div
                              key={stat.id}
                              className="position-absolute bg-white px-3 py-2 rounded-4 shadow-sm border text-center"
                              style={{
                                 zIndex: 3,
                                 minWidth: "105px",
                                 boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.06)",
                                 ...positionStyle,
                              }}
                           >
                              <span className="d-block fw-bold fs-5 primary-text lh-1">
                                 {stat.value}
                              </span>
                              <small
                                 className="text-950 fw-medium"
                                 style={{ fontSize: "1rem" }}
                              >
                                 {stat.label}
                              </small>
                           </div>
                        );
                     })}
                  </div>
               </Col>

               {/* Right Column - Text Content */}
               <Col lg={6} className="ps-lg-4">
                  <h2 className="fw-bold fs-1 text-950 mb-3 lh-tight">
                     {sectionData.mainTitle}{" "}
                     <span className="primary-text">
                        {sectionData.highlightTitle}
                     </span>{" "}
                     {sectionData.endTitle}
                  </h2>

                  <div className="text-700 lh-base mb-4 fs-6 style-divreserve-whitespace">
                     <ReactMarkdown>{sectionData.description}</ReactMarkdown>
                  </div>

                  {sectionData.buttonText && sectionData.buttonLink && (
                     <div className="text-lg-end text-start">
                        <Link
                           href={sectionData.buttonLink}
                           className="btn btn-dark rounded-4 px-4 py-2 fw-medium shadow-sm fs-6"
                        >
                           {sectionData.buttonText}
                        </Link>
                     </div>
                  )}
               </Col>
            </Row>
         </Container>
      </section>
   );
};

export default ExploreWorld;
