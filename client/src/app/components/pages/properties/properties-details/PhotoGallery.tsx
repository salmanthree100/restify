"use client";

import React, { useState, useMemo } from "react";
import { Modal, Button } from "react-bootstrap";
import { getStrapiMedia } from "@/lib/utils";
import Image from "next/image";

interface ImageFormat {
   url: string;
   width: number;
   height: number;
}

interface PhotoImage {
   id: number;
   name: string;
   alternativeText?: string | null;
   caption?: string | null;
   url: string;
   width?: number;
   height?: number;
   formats?: {
      thumbnail?: ImageFormat;
      small?: ImageFormat;
      medium?: ImageFormat;
      large?: ImageFormat;
   };
}

export interface PhotoCategory {
   id: number;
   category: string;
   images: PhotoImage[];
}

interface PhotoGalleryProps {
   show: boolean;
   onHide: () => void;
   categorizedPhotos: PhotoCategory[];
   initialImageId?: number | null;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
   show,
   onHide,
   categorizedPhotos = [],
   initialImageId,
}) => {
   const [selectedCategory, setSelectedCategory] = useState<string>("All");
   const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

   // Extract unique category names
   const categories = useMemo(() => {
      return ["All", ...categorizedPhotos.map((cat) => cat.category)];
   }, [categorizedPhotos]);

   // Filter images based on selected category tab
   const activeImages = useMemo(() => {
      if (selectedCategory === "All") {
         const allImages = categorizedPhotos.flatMap((cat) => cat.images);
         return Array.from(
            new Map(allImages.map((img) => [img.id, img])).values(),
         );
      }
      const categoryMatch = categorizedPhotos.find(
         (cat) => cat.category === selectedCategory,
      );
      return categoryMatch ? categoryMatch.images : [];
   }, [selectedCategory, categorizedPhotos]);

   // Derived current index without calling setState in useEffect
   const currentIndex = useMemo(() => {
      if (selectedIndex !== null) {
         return Math.min(selectedIndex, Math.max(0, activeImages.length - 1));
      }
      if (initialImageId) {
         const foundIdx = activeImages.findIndex(
            (img) => img.id === initialImageId,
         );
         return foundIdx !== -1 ? foundIdx : 0;
      }
      return 0;
   }, [selectedIndex, initialImageId, activeImages]);

   const handlePrev = () => {
      setSelectedIndex(() =>
         currentIndex === 0 ? activeImages.length - 1 : currentIndex - 1,
      );
   };

   const handleNext = () => {
      setSelectedIndex(() =>
         currentIndex === activeImages.length - 1 ? 0 : currentIndex + 1,
      );
   };

   const activeImage = activeImages[currentIndex];

   return (
      <Modal
         show={show}
         onHide={onHide}
         fullscreen
         centered
         contentClassName="border-0"
      >
         {/* Top Header Controls */}
         <Modal.Header className="border-0 px-4 pt-3 pb-2 flex-wrap justify-content-between align-items-center">
            {/* Category Pills */}
            <div className="d-flex align-items-center gap-2 overflow-auto pb-2 me-auto">
               {categories.map((cat) => (
                  <button
                     key={cat}
                     onClick={() => {
                        setSelectedCategory(cat);
                        setSelectedIndex(0);
                     }}
                     className={`btn btn-sm rounded-4 px-3 py-2 fw-medium transition-all ${
                        selectedCategory === cat
                           ? "btn-light text-dark fw-bold border-dark"
                           : "btn-outline-light text-dark border-secondary-subtle"
                     }`}
                  >
                     {cat}
                  </button>
               ))}
            </div>

            {/* Close Modal Button */}
            <Button
               variant="link"
               onClick={onHide}
               className="text-decoration-none fs-4 p-0 ms-3 text-dark"
               aria-label="Close"
            >
               ✕
            </Button>
         </Modal.Header>

         {/* Main Lightbox Body */}
         <Modal.Body className="d-flex flex-column align-items-center justify-content-between position-relative px-4 py-2">
            {activeImages.length > 0 && activeImage ? (
               <>
                  {/* Prev Button */}
                  <button
                     onClick={handlePrev}
                     className="position-absolute start-0 top-50 translate-middle-y ms-4 btn btn-light border-secondary rounded-circle shadow p-0 d-flex align-items-center justify-content-center z-3"
                     style={{ width: "44px", height: "44px" }}
                     aria-label="Previous image"
                  >
                     ‹
                  </button>

                  {/* Featured Main Image Preview */}
                  <div
                     className="position-relative w-100 flex-grow-1 d-flex align-items-center justify-content-center my-auto"
                     style={{ maxHeight: "65vh" }}
                  >
                     <Image
                        src={getStrapiMedia(activeImage.url) || ""}
                        width={activeImage.width}
                        height={activeImage.height}
                        alt={
                           activeImage.alternativeText ||
                           activeImage.name ||
                           "Gallery image"
                        }
                        className="rounded-4 shadow-lg object-fit-contain"
                        style={{
                           maxHeight: "65vh",
                           width: "100%",
                           height: "100%",
                        }}
                     />
                  </div>

                  {/* Next Button */}
                  <button
                     onClick={handleNext}
                     className="position-absolute end-0 top-50 translate-middle-y me-4 btn btn-light border-secondary rounded-circle shadow p-0 d-flex align-items-center justify-content-center z-3"
                     style={{ width: "44px", height: "44px" }}
                     aria-label="Next image"
                  >
                     ›
                  </button>

                  {/* Bottom Horizontal Thumbnail Strip */}
                  <div className="w-100 overflow-auto pt-3 pb-2">
                     <div className="d-flex justify-content-center gap-2">
                        {activeImages.map((img, idx) => (
                           <div
                              key={img.id}
                              onClick={() => setSelectedIndex(idx)}
                              className={`position-relative rounded-3 overflow-hidden border ${
                                 currentIndex === idx
                                    ? "border-3 border-white opacity-100"
                                    : "border-transparent opacity-50"
                              }`}
                              style={{
                                 width: "80px",
                                 height: "60px",
                                 flexShrink: 0,
                                 cursor: "pointer",
                              }}
                           >
                              <Image
                                 src={
                                    getStrapiMedia(
                                       img.formats?.thumbnail?.url ||
                                          img.formats?.small?.url ||
                                          img.url,
                                    ) || ""
                                 }
                                 width={img.width}
                                 height={img.height}
                                 alt={img.name || "Thumbnail"}
                                 className="w-100 h-100 object-fit-cover"
                              />
                           </div>
                        ))}
                     </div>
                  </div>
               </>
            ) : (
               <div className="text-white-50 my-auto">
                  No photos in this category.
               </div>
            )}
         </Modal.Body>
      </Modal>
   );
};

export default PhotoGallery;
