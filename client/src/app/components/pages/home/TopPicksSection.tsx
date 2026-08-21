"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import { Container, Row, Col, Spinner, Button } from "react-bootstrap";
import qs from "qs";
import { getStrapiMedia } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface CategoryImage {
   id: number;
   url: string;
   alternativeText: string | null;
   width: number;
   height: number;
}

interface CategoryCardData {
   id: number;
   title: string;
   subtitle?: string;
   description?: string;
   link?: string;
   image: CategoryImage | null;
}

interface TopPicksData {
   title: string;
   subtitle: string;
   buttonText: string;
   buttonLink: string;
   categories: CategoryCardData[];
}

const TopPicksSection = () => {
   const { locale } = useLocale();
   const [topPicksData, setTopPicksData] = useState<TopPicksData | null>(null);
   const [loading, setLoading] = useState<boolean>(true);

   useEffect(() => {
      async function fetchTopPicksData() {
         setLoading(true);

         const query = qs.stringify(
            {
               populate: {
                  topPicks: {
                     populate: {
                        categories: {
                           populate: ["image"],
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
            setTopPicksData(result?.data?.topPicks || null);
         } catch (error) {
            console.error("Error fetching journey section:", error);
         } finally {
            setLoading(false);
         }
      }

      fetchTopPicksData();
   }, [locale]);

   if (loading) {
      return (
         <section className="py-5 bg-white text-center">
            <Spinner animation="border" variant="danger" />
         </section>
      );
   }

   if (!topPicksData) return null;

   const {
      title,
      subtitle,
      buttonText,
      buttonLink,
      categories = [],
   } = topPicksData;

   const apartments = categories[0];
   const houses = categories[1];
   const cabins = categories[2];
   const hotels = categories[3];

   return (
      <section className="py-5 bg-white">
         <Container>
            <Row className="g-4 align-items-stretch">
               {/* Left Column: Title + Apartments (Fills remaining height) */}
               <Col lg={4} className="d-flex flex-column gap-4">
                  <div>
                     <h2 className="fw-bold fs-1 text-dark mb-1">{title}</h2>
                     <p className="text-secondary mb-4">{subtitle}</p>
                     {buttonText && buttonLink && (
                        <Link href={buttonLink}>
                           <Button
                              variant="dark"
                              className="rounded-4 px-4 py-2 fw-semibold text-white shadow-sm w-100"
                           >
                              {buttonText}
                           </Button>
                        </Link>
                     )}
                  </div>

                  {apartments && <CategoryCard item={apartments} isFlexFill />}
               </Col>

               {/* Middle Column: Houses + Cabins */}
               <Col lg={4} className="d-flex flex-column gap-4">
                  {houses && (
                     <CategoryCard item={houses} desktopMinHeight="290px" />
                  )}
                  {cabins && (
                     <CategoryCard item={cabins} desktopMinHeight="290px" />
                  )}
               </Col>

               {/* Right Column: Tall Hotels Card */}
               <Col lg={4} className="d-flex flex-column">
                  {hotels && <CategoryCard item={hotels} isFlexFill />}
               </Col>
            </Row>
         </Container>
      </section>
   );
};

function CategoryCard({
   item,
   desktopMinHeight,
   isFlexFill = false,
}: {
   item: CategoryCardData;
   desktopMinHeight?: string;
   isFlexFill?: boolean;
}) {
   const imageUrl = getStrapiMedia(item.image?.url);
   const cardLink = item.link || "/destinations";
   const subtext = item.subtitle || item.description;

   return (
      <Link
         href={cardLink}
         className={`card-item position-relative overflow-hidden rounded-5 shadow-sm text-decoration-none d-block w-100 ${
            isFlexFill ? "flex-grow-1" : ""
         }`}
         style={{
            minHeight: "280px",
         }}
      >
         <div className="position-relative w-100 h-100">
            {imageUrl && (
               <Image
                  src={imageUrl}
                  alt={item.image?.alternativeText || item.title}
                  fill
                  sizes="(max-width: 992px) 100vw, 33vw"
                  className="object-fit-cover"
                  priority
               />
            )}

            {/* Gradient Overlay */}
            <div
               className="position-absolute top-0 start-0 w-100 h-100"
               style={{
                  background:
                     "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)",
                  zIndex: 1,
               }}
            />

            {/* Content */}
            <div
               className="position-absolute bottom-0 start-0 p-4 text-white"
               style={{ zIndex: 2 }}
            >
               <h3 className="fw-bold fs-3 mb-1">{item.title}</h3>
               {subtext && (
                  <p className="small opacity-75 mb-0 fw-normal">{subtext}</p>
               )}
            </div>
         </div>

         <style jsx>{`
            @media (min-width: 992px) {
               .card-item {
                  ${!isFlexFill && desktopMinHeight
                     ? `height: ${desktopMinHeight};`
                     : ""}
                  ${isFlexFill ? "height: 100%;" : ""}
               }
            }
         `}</style>
      </Link>
   );
}

export default TopPicksSection;
