"use client";

import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Image from "next/image";
import { FaStar } from "react-icons/fa6";
import {
   LuSparkles,
   LuKey,
   LuMessageSquare,
   LuMapPin,
   LuTag,
} from "react-icons/lu";
import { HiOutlineCheckCircle } from "react-icons/hi2";
import { getStrapiMedia } from "@/lib/utils";

// Types corresponding to Strapi Data structure
export interface ReviewsSection {
   id: number;
   title?: string;
   description?: string;
   averageRating?: number;
   averageRatingLabel?: string;
   cleanlinessRating?: number;
   cleanlinessRatingLabel?: string;
   accuracyRating?: number;
   accuracyRatingLabel?: string;
   checkInRating?: number;
   checkInRatingLabel?: string;
   communicationRating?: number;
   communicationRatingLabel?: string;
   locationRating?: number;
   locationRatingLabel?: string;
   valueRating?: number;
   valueRatingLabel?: string;
}

export interface ReviewItem {
   id: number;
   reviewerName?: string;
   reviewerCountry?: string;
   reviewerAvatar?: {
      url?: string;
      width: number;
      height: number;
   };
   reviewDate: string;
   comment?: string;
   reviewerRating: number;
}

interface GuestReviewsProps {
   reviewsSection?: ReviewsSection;
   reviews?: ReviewItem[];
   rating?: number;
   reviewsCount?: number;
}

const GuestReviews: React.FC<GuestReviewsProps> = ({
   reviewsSection,
   reviews = [],
}) => {
   if (!reviewsSection) return null;

   // Rating categories mapping with React Icons
   const ratingCategories = [
      {
         label: reviewsSection.cleanlinessRatingLabel || "Cleanliness",
         score: reviewsSection.cleanlinessRating ?? 5.0,
         icon: <LuSparkles className="text-secondary fs-4" />,
      },
      {
         label: reviewsSection.accuracyRatingLabel || "Accuracy",
         score: reviewsSection.accuracyRating ?? 4.8,
         icon: <HiOutlineCheckCircle className="text-secondary fs-4" />,
      },
      {
         label: reviewsSection.checkInRatingLabel || "Check-in",
         score: reviewsSection.checkInRating ?? 4.7,
         icon: <LuKey className="text-secondary fs-4" />,
      },
      {
         label: reviewsSection.communicationRatingLabel || "Communication",
         score: reviewsSection.communicationRating ?? 4.8,
         icon: <LuMessageSquare className="text-secondary fs-4" />,
      },
      {
         label: reviewsSection.locationRatingLabel || "Location",
         score: reviewsSection.locationRating ?? 4.0,
         icon: <LuMapPin className="text-secondary fs-4" />,
      },
      {
         label: reviewsSection.valueRatingLabel || "Value",
         score: reviewsSection.valueRating ?? 4.6,
         icon: <LuTag className="text-secondary fs-4" />,
      },
   ];

   // format comment date:
   function formatDate(dateString: string) {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
         month: "long",
         day: "numeric",
         year: "numeric",
      });
   }

   // Circular Progress Wrapper Component for the Icons
   const RatingProgressCircle: React.FC<{
      score: number;
      maxScore?: number;
      children: React.ReactNode;
   }> = ({ score, maxScore = 5, children }) => {
      const size = 52;
      const strokeWidth = 3;
      const radius = (size - strokeWidth) / 2;
      const circumference = 2 * Math.PI * radius;
      const progressPercentage = Math.min(Math.max(score / maxScore, 0), 1);
      const strokeDashoffset =
         circumference - progressPercentage * circumference;

      return (
         <div
            className="position-relative d-inline-flex align-items-center justify-content-center"
            style={{ width: size, height: size }}
         >
            <svg
               width={size}
               height={size}
               className="position-absolute"
               style={{ transform: "rotate(-90deg)" }}
            >
               {/* Background Track Circle */}
               <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#E5E7EB"
                  strokeWidth={strokeWidth}
                  fill="transparent"
               />
               {/* Dynamic Score Fill Circle */}
               <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#E23212"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
               />
            </svg>
            {/* Icon centered inside ring */}
            <div className="position-relative z-1 d-flex align-items-center justify-content-center text-dark">
               {children}
            </div>
         </div>
      );
   };

   return (
      <section className="py-5">
         <Container>
            {/* Banner Section */}
            <div className="text-center mb-5">
               <h2 className="fw-bold mb-2">
                  {reviewsSection.title || "Guest reviews"}
               </h2>
               <p
                  className="text-muted max-w-md mx-auto"
                  style={{ maxWidth: "600px" }}
               >
                  {reviewsSection.description}
               </p>
            </div>

            {/* Rating Breakdown Grid */}
            <div
               className="mb-5 pb-4 border-bottom d-grid gap-4 text-center"
               style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
               }}
            >
               {/* Item Average Tile */}
               <div className="d-flex flex-column align-items-center justify-content-center px-2">
                  <div className="d-flex align-items-center gap-1 mb-1">
                     <FaStar className="text-warning fs-5" />
                     <span className="fw-bold fs-4 text-dark">
                        {(reviewsSection?.averageRating || 4.9).toFixed(1)}
                        <span className="fs-6 text-muted fw-normal"> / 5</span>
                     </span>
                  </div>
                  <span className="text-muted small fw-medium">
                     {reviewsSection.averageRatingLabel || "Item average"}
                  </span>
               </div>

               {/* Category Tiles with Progress Outline */}
               {ratingCategories.map((item, idx) => (
                  <div
                     key={idx}
                     className="d-flex flex-column align-items-center justify-content-between px-2"
                  >
                     <div className="d-flex align-items-center gap-1 mb-2">
                        <FaStar className="text-warning small" />
                        <span className="fw-bold text-dark small">
                           {item.score.toFixed(1)}
                        </span>
                     </div>

                     {/* Circular Progress Outline */}
                     <div className="mb-2">
                        <RatingProgressCircle score={item.score}>
                           {item.icon}
                        </RatingProgressCircle>
                     </div>

                     <span className="text-muted small text-capitalize fw-medium">
                        {item.label}
                     </span>
                  </div>
               ))}
            </div>

            {/* Individual Reviews Section */}
            {reviews.length > 0 && (
               <div>
                  <Row className="g-4">
                     {reviews.map((review) => {
                        const avatarUrl =
                           getStrapiMedia(review.reviewerAvatar?.url) || "";

                        return (
                           <Col xs={12} md={6} key={review.id}>
                              <Card className="border-0 h-100 p-2">
                                 <Card.Body className="p-0">
                                    {/* Reviewer Header */}
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                       <div className="d-flex align-items-center overflow-hidden position-relative">
                                          <div className="me-2">
                                             <Image
                                                src={avatarUrl}
                                                width={
                                                   review.reviewerAvatar?.width
                                                }
                                                height={
                                                   review.reviewerAvatar?.height
                                                }
                                                alt={
                                                   review.reviewerName ||
                                                   "Guest Avatar"
                                                }
                                             />
                                          </div>
                                          <div>
                                             <h6 className="fw-bold mb-0">
                                                {review.reviewerName ||
                                                   "Anonymous Guest"}
                                             </h6>
                                             <small className="text-muted">
                                                {review.reviewerCountry ||
                                                   "Verified Guest"}
                                             </small>
                                          </div>
                                       </div>
                                       <div className="text-dark">
                                          <span className="me-1 text-warning">
                                             <FaStar />
                                          </span>
                                          <span>{review.reviewerRating}</span>
                                       </div>
                                    </div>

                                    {/* Review Text */}
                                    <Card.Text className="text-secondary lh-base">
                                       {review.comment}
                                    </Card.Text>
                                    {/* Review Date */}
                                    <div className="text-end mb-2">
                                       <small className="text-muted fw-medium">
                                          {formatDate(review.reviewDate) ||
                                             "Recently"}
                                       </small>
                                    </div>
                                 </Card.Body>
                              </Card>
                           </Col>
                        );
                     })}
                  </Row>
               </div>
            )}
         </Container>
      </section>
   );
};

export default GuestReviews;
