"use client";

import React from "react";
import Image from "next/image";
import { Container, Row, Col } from "react-bootstrap";
import ReactMarkdown from "react-markdown";

export interface PolicyItem {
   id: number;
   title: string;
   description: string;
}

export interface PropertyPolicies {
   id: number;
   title: string;
   description?: string;
   policyName: PolicyItem[];
}

interface PoliciesSectionProps {
   propertyPolicies?: PropertyPolicies;
}

const PoliciesSection: React.FC<PoliciesSectionProps> = ({
   propertyPolicies,
}) => {
   if (!propertyPolicies || !propertyPolicies.policyName?.length) {
      return null;
   }

   const { title, description, policyName } = propertyPolicies;

   const baseUrl =
      process.env.NEXT_PUBLIC_STRAPI_CLOUD_URL ||
      process.env.NEXT_PUBLIC_STRAPI_LOCAL_URL ||
      "http://localhost:1337";

   return (
      <section className="py-4 border-top">
         <Container>
            {/* Main Section Header */}
            <div className="mb-4">
               <h3 className="fw-bold fs-4 text-dark mb-2">{title}</h3>
               {description && (
                  <p className="text-secondary mb-0 fs-6">{description}</p>
               )}
            </div>

            {/* Policy Rows Table/List View */}
            <div className="border rounded-4 bg-white p-3 p-md-4">
               {policyName.map((policy, index) => {
                  const isLast = index === policyName.length - 1;

                  return (
                     <Row
                        key={policy.id}
                        className={`py-3 align-items-baseline ${
                           !isLast ? "border-bottom" : ""
                        }`}
                     >
                        {/* Left Column: Policy Title */}
                        <Col lg={4} md={5} className="mb-2 mb-md-0">
                           <h6 className="fw-bold text-dark fs-6 mb-0">
                              {policy.title}
                           </h6>
                        </Col>

                        {/* Right Column: Policy Description/Content */}
                        <Col lg={8} md={7}>
                           <div className="text-secondary policy-content fs-6">
                              <ReactMarkdown
                                 components={{
                                    // Handle formatting (bold, paragraphs, etc.)
                                    p: ({ children }) => (
                                       <p className="mb-2 last-p-mb-0">
                                          {children}
                                       </p>
                                    ),
                                    // Handle bank card logos/images rendered inside markdown
                                    img: ({ src, alt }) => {
                                       if (!src || typeof src !== "string")
                                          return null;

                                       const imageUrl = src.startsWith("http")
                                          ? src
                                          : `${baseUrl}${src}`;

                                       return (
                                          <span className="d-inline-block mt-2">
                                             <Image
                                                src={imageUrl}
                                                alt={alt || "Accepted Cards"}
                                                width={317}
                                                height={24}
                                                style={{
                                                   objectFit: "contain",
                                                   maxHeight: "45px",
                                                   width: "auto",
                                                }}
                                             />
                                          </span>
                                       );
                                    },
                                 }}
                              >
                                 {policy.description}
                              </ReactMarkdown>
                           </div>
                        </Col>
                     </Row>
                  );
               })}
            </div>
         </Container>
      </section>
   );
};

export default PoliciesSection;
