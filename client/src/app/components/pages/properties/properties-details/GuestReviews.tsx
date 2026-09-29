"use client";

import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Image from "next/image";
import { FaStar, FaRegStar, FaTrophy } from "react-icons/fa6";
import {
   LuSparkles,
   LuKey,
   LuMessageSquare,
   LuMapPin,
   LuTag,
} from "react-icons/lu";
import { HiOutlineCheckCircle } from "react-icons/hi2";

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
   reviewerLocation?: string;
   reviewerAvatar?: {
      url?: string;
   };
   rating?: number;
   date?: string;
   comment?: string;
   timeAgo?: string;
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
   rating = 4.9,
   reviewsCount = 43,
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

   const baseUrl =
      process.env.NEXT_PUBLIC_STRAPI_CLOUD_URL ||
      process.env.NEXT_PUBLIC_STRAPI_LOCAL_URL ||
      "http://localhost:1337";

   return (
      <section className="py-5 border-top">
         <Container>
            {/* Banner Section */}
            <div className="text-center mb-5">
               <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
                  <span className="display-3 fw-bold text-dark">
                     {reviewsSection.averageRating || rating}
                  </span>
                  <FaTrophy className="text-warning display-5" />
               </div>
               <h2 className="fw-bold mb-2">
                  {reviewsSection.title || "Guest reviews"}
               </h2>
               <p
                  className="text-muted max-w-md mx-auto"
                  style={{ maxWidth: "600px" }}
               >
                  {reviewsSection.description ||
                     "This home is in the top 5% of eligible listings based on ratings, reviews, and reliability."}
               </p>
            </div>

            {/* Rating Breakdown Grid */}
            <Row className="g-4 mb-5 pb-4 border-bottom">
               {ratingCategories.map((item, idx) => (
                  <Col xs={12} sm={6} md={4} lg={2} key={idx}>
                     <Card className="h-100 border-0 bg-light p-3 rounded-3 text-start">
                        <Card.Body className="p-0 d-flex flex-column justify-content-between">
                           <div className="mb-3">
                              <span className="fw-semibold text-dark d-block mb-1">
                                 {item.label}
                              </span>
                              <span className="fs-4 fw-bold">
                                 {item.score.toFixed(1)}
                              </span>
                           </div>
                           <div>{item.icon}</div>
                        </Card.Body>
                     </Card>
                  </Col>
               ))}
            </Row>

            {/* Individual Reviews Section */}
            {reviews.length > 0 && (
               <div>
                  <h4 className="fw-bold mb-4">
                     {reviewsCount} {reviewsCount === 1 ? "Review" : "Reviews"}
                  </h4>
                  <Row className="g-4">
                     {reviews.map((review) => {
                        const avatarUrl = review.reviewerAvatar?.url
                           ? review.reviewerAvatar.url.startsWith("http")
                              ? review.reviewerAvatar.url
                              : `${baseUrl}${review.reviewerAvatar.url}`
                           : "/images/default-avatar.png";

                        return (
                           <Col xs={12} md={6} key={review.id}>
                              <Card className="border-0 h-100 p-2">
                                 <Card.Body className="p-0">
                                    {/* Reviewer Header */}
                                    <div className="d-flex align-items-center mb-3">
                                       <div
                                          className="rounded-circle overflow-hidden me-3 position-relative"
                                          style={{
                                             width: "48px",
                                             height: "48px",
                                          }}
                                       >
                                          <Image
                                             src={avatarUrl}
                                             alt={
                                                review.reviewerName ||
                                                "Guest Avatar"
                                             }
                                             fill
                                             className="object-fit-cover"
                                          />
                                       </div>
                                       <div>
                                          <h6 className="fw-bold mb-0">
                                             {review.reviewerName ||
                                                "Anonymous Guest"}
                                          </h6>
                                          <small className="text-muted">
                                             {review.reviewerLocation ||
                                                "Verified Guest"}
                                          </small>
                                       </div>
                                    </div>

                                    {/* Rating Stars & Date */}
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                       <div className="d-flex text-warning">
                                          {[...Array(5)].map((_, i) =>
                                             i <
                                             Math.floor(review.rating || 5) ? (
                                                <FaStar
                                                   key={i}
                                                   className="me-1"
                                                />
                                             ) : (
                                                <FaRegStar
                                                   key={i}
                                                   className="me-1"
                                                />
                                             ),
                                          )}
                                       </div>
                                       <small className="text-muted fw-medium">
                                          ·{" "}
                                          {review.timeAgo ||
                                             review.date ||
                                             "Recently"}
                                       </small>
                                    </div>

                                    {/* Review Text */}
                                    <Card.Text className="text-secondary lh-base">
                                       {review.comment}
                                    </Card.Text>
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
