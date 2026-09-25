"use client";

import React, { useState } from "react";
import Slider, { Settings } from "react-slick";
import PhotoGallery, { PhotoCategory } from "./PhotoGallery";
import { getStrapiMedia } from "@/lib/utils";
import { Container } from "react-bootstrap";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";

interface HeroSliderProps {
   categorizedPhotos: PhotoCategory[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
   categorizedPhotos = [],
}) => {
   const [isGalleryOpen, setIsGalleryOpen] = useState(false);
   const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

   // Flatten and deduplicate images across all categories
   const allImages = Array.from(
      new Map(
         categorizedPhotos
            .flatMap((cat) => cat.images)
            .map((img) => [img.id, img]),
      ).values(),
   );

   const handleOpenGallery = (imageId?: number) => {
      if (imageId) setSelectedImageId(imageId);
      setIsGalleryOpen(true);
   };

   const sliderSettings: Settings = {
      className: "center",
      centerMode: true,
      infinite: allImages.length > 5,
      centerPadding: "0px",
      slidesToShow: 5,
      speed: 500,
      focusOnSelect: true,
      arrows: false,
      dots: false,
      responsive: [
         {
            breakpoint: 992,
            settings: {
               slidesToShow: 3,
            },
         },
         {
            breakpoint: 576,
            settings: {
               slidesToShow: 1,
            },
         },
      ],
   };

   return (
      <section style={{ marginBottom: "24px", marginTop: "42px" }}>
         <Container>
            <div className="position-relative overflow-hidden">
               {/* Custom Styles for Center-Focused Slide Scaling */}
               <style jsx global>{`
                  .hero-slick-slider .slick-list {
                     padding: 20px 0 !important;
                     overflow: visible;
                  }
                  .hero-slick-slider .slick-slide {
                     transition: all 0.3s ease-in-out;
                     opacity: 0.85;
                     transform: scale(0.88);
                     padding: 0 6px;
                  }
                  .hero-slick-slider .slick-center {
                     opacity: 1;
                     transform: scale(1.08);
                     z-index: 2;
                  }
                  .hero-slick-slider .slide-card {
                     height: 380px;
                     border-radius: 20px;
                     overflow: hidden;
                     cursor: pointer;
                     position: relative;
                  }
                  @media (max-width: 768px) {
                     .hero-slick-slider .slide-card {
                        height: 280px;
                     }
                  }
               `}</style>

               <div className="container-fluid px-2 hero-slick-slider">
                  {allImages.length > 0 ? (
                     <Slider {...sliderSettings}>
                        {allImages.map((img) => (
                           <div
                              key={img.id}
                              onClick={() => handleOpenGallery(img.id)}
                           >
                              <div className="slide-card shadow-sm border-0 position-relative">
                                 <Image
                                    src={getStrapiMedia(img.url) || ""}
                                    width={img.width}
                                    height={img.height}
                                    alt={
                                       img.alternativeText ||
                                       img.name ||
                                       "Gallery photo"
                                    }
                                    className="w-100 h-100 object-fit-cover d-block"
                                 />
                                 {/* Category / Icon Badge Overlay */}
                                 <div
                                    className="position-absolute bottom-0 start-50 translate-middle-x mb-3 bg-white rounded-circle shadow d-flex align-items-center justify-content-center"
                                    style={{ width: "40px", height: "40px" }}
                                 >
                                    <svg
                                       width="18"
                                       height="18"
                                       viewBox="0 0 24 24"
                                       fill="none"
                                       stroke="currentColor"
                                       strokeWidth="2"
                                       strokeLinecap="round"
                                       strokeLinejoin="round"
                                    >
                                       <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                       <polyline points="9 22 9 12 15 12 15 22" />
                                    </svg>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </Slider>
                  ) : (
                     <div className="text-center py-5 text-muted">
                        No images available
                     </div>
                  )}

                  {/* Floating "See more photos" Button */}
                  <button
                     onClick={() => handleOpenGallery()}
                     className="btn btn-light rounded-pill position-absolute bottom-0 end-0 me-4 shadow-sm border fw-semibold d-flex align-items-center gap-2 z-3 px-3 py-2"
                     style={{ fontSize: "0.875rem" }}
                  >
                     <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                     >
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                     </svg>
                     See more photos
                  </button>
               </div>

               {/* Lightbox Modal */}
               <PhotoGallery
                  show={isGalleryOpen}
                  onHide={() => setIsGalleryOpen(false)}
                  categorizedPhotos={categorizedPhotos}
                  initialImageId={selectedImageId}
               />
            </div>
         </Container>
      </section>
   );
};

export default HeroSlider;
