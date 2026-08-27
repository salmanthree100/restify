"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { getStrapiMedia } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import qs from "qs";

interface FeatureIcon {
   id: number;
   documentId: string;
   url: string;
   alternativeText: string | null;
   width: number;
   height: number;
}

interface SideImage {
   id: number;
   documentId: string;
   url: string;
   alternativeText: string | null;
   width: number;
   height: number;
}

interface Feature {
   id: number;
   title: string;
   description: string;
   icon: FeatureIcon | null;
}

interface ServicesOfferProps {
   mainTitle: string;
   highlightTitle: string;
   endTitle: string;
   sideImage: SideImage | null;
   features: Feature[];
}

const ServicesOffer = () => {
   const { locale } = useLocale();
   const [sectionData, setSectionData] = useState<ServicesOfferProps | null>(
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
                        "blocks.services-offer": {
                           populate: {
                              sideImage: { populate: "*" },
                              features: {
                                 populate: {
                                    icon: { populate: "*" },
                                 },
                              },
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
            console.error("Error fetching services offer section:", error);
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

   const { mainTitle, highlightTitle, endTitle, sideImage, features } =
      sectionData;
   const sideImageUrl = sideImage?.url ? getStrapiMedia(sideImage.url) : null;

   return (
      <section className="services-offer-area py-5">
         <Container className="border rounded-5 p-3 p-sm-4 p-lg-5 shadow-sm">
            <Row className="align-items-center">
               {/* Side Image Column */}
               {sideImageUrl && (
                  <Col
                     lg={6}
                     md={12}
                     className="mb-4 mb-lg-0 order-lg-2 order-1"
                  >
                     <div className="services-offer-image text-center">
                        <Image
                           src={sideImageUrl}
                           alt={
                              sideImage?.alternativeText ||
                              mainTitle ||
                              "Services"
                           }
                           width={sideImage?.width || 612}
                           height={sideImage?.height || 496}
                           className="img-fluid rounded"
                           priority
                        />
                     </div>
                  </Col>
               )}

               {/* Content Column */}
               <Col
                  lg={sideImageUrl ? 6 : 12}
                  md={12}
                  className="order-lg-1 order-2"
               >
                  <div className="services-offer-content ps-lg-4">
                     <div className="section-title mb-4">
                        <h2 className="fw-bold fs-1 text-900">
                           {mainTitle}{" "}
                           {highlightTitle && (
                              <span className="primary-text">
                                 {highlightTitle}
                              </span>
                           )}{" "}
                           {endTitle}
                        </h2>
                     </div>

                     {/* Features List */}
                     {features && features.length > 0 && (
                        <div className="features-list">
                           {features.map((feature) => {
                              const iconUrl = feature.icon?.url
                                 ? getStrapiMedia(feature.icon.url)
                                 : null;

                              return (
                                 <div
                                    key={feature.id}
                                    className="feature-item d-flex align-items-start mb-4"
                                 >
                                    {iconUrl && (
                                       <div className="feature-icon me-3 flex-shrink-0">
                                          <Image
                                             src={iconUrl}
                                             alt={
                                                feature.icon?.alternativeText ||
                                                feature.title
                                             }
                                             width={feature.icon?.width || 32}
                                             height={feature.icon?.height || 32}
                                          />
                                       </div>
                                    )}
                                    <div className="feature-info">
                                       <h4 className="mb-1 h5 text-900">
                                          {feature.title}
                                       </h4>
                                       <p className="mb-0 text-600">
                                          {feature.description}
                                       </p>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     )}
                  </div>
               </Col>
            </Row>
         </Container>
      </section>
   );
};

export default ServicesOffer;
