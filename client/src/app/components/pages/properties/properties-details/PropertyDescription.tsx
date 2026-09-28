import React from "react";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import {
   FaStar,
   FaBed,
   FaBath,
   FaUsers,
   FaCheck,
   FaShieldAlt,
   FaKey,
   FaMapMarkerAlt,
} from "react-icons/fa";
import { ICON_KEYWORDS } from "@/lib/utils";

// Node Interfaces
export interface TextNode {
   type: string;
   text: string;
}

export interface ListItemNode {
   type: "list-item";
   children?: TextNode[];
}

// Discriminated Unions for Strapi Nodes
export interface ParagraphNode {
   type: "paragraph";
   children?: TextNode[];
}

export interface ListNode {
   type: "list";
   format?: "unordered" | "ordered";
   children?: ListItemNode[];
}

export type DescriptionNode = ParagraphNode | ListNode;

export interface PropertyDescriptionProps {
   title?: string;
   rating?: number;
   reviewsCount?: number;
   bedrooms?: number;
   bathrooms?: number;
   maxGuests?: number;
   propertyType?: string;
   bedroomsText?: string;
   bathroomsText?: string;
   description?: DescriptionNode[];
}

export const PropertyDescription: React.FC<PropertyDescriptionProps> = ({
   title,
   rating,
   reviewsCount,
   bedrooms,
   bathrooms,
   maxGuests,
   propertyType,
   bedroomsText,
   bathroomsText,
   description = [],
}) => {
   // Helper function to render text nodes
   const renderChildrenText = (children?: TextNode[]) => {
      if (!children) return null;
      return children.map((child, index) => (
         <span key={index}>{child.text}</span>
      ));
   };

   // Helper function to extract plain text string
   const getNodeText = (children?: TextNode[]): string => {
      if (!children) return "";
      return children.map((child) => child.text).join(" ");
   };

   // Dynamically map an icon based on list item content
   const getListItemIcon = (children?: TextNode[], index?: number) => {
      const text = getNodeText(children).toLowerCase();

      const iconProps = {
         color: "#D02D11",
         className: "me-2 mt-1 flex-shrink-0",
         size: 16,
      };

      // 1. First check multilingual keywords
      if (ICON_KEYWORDS.location.some((k) => text.includes(k)))
         return <FaMapMarkerAlt {...iconProps} />;
      if (ICON_KEYWORDS.security.some((k) => text.includes(k)))
         return <FaShieldAlt {...iconProps} />;
      if (ICON_KEYWORDS.key.some((k) => text.includes(k)))
         return <FaKey {...iconProps} />;

      // 2. Positional Fallback if no language keyword matches
      switch (index) {
         case 0:
            return <FaMapMarkerAlt {...iconProps} />;
         case 1:
            return <FaShieldAlt {...iconProps} />;
         case 2:
            return <FaKey {...iconProps} />;
         default:
            return <FaCheck {...iconProps} />;
      }
   };

   return (
      <section>
         <Container>
            <Row>
               <Col lg={8}>
                  <Card className="border-0 shadow-sm mb-2 rounded-4">
                     <Card.Body>
                        {/* Header Section */}
                        <div className="d-flex justify-content-between align-items-start mb-3">
                           <div>
                              <Badge
                                 bg="secondary"
                                 className="mb-2 px-3 py-2 fw-semibold"
                              >
                                 {propertyType}
                              </Badge>
                              <h2 className="fw-bold mb-1">{title}</h2>
                           </div>
                           <div className="d-flex align-items-center bg-light px-3 py-2 rounded-pill">
                              <FaStar className="text-warning me-1 mb-1" />
                              <span className="fw-bold me-1">{rating}</span>
                              <span className="text-muted">
                                 ({reviewsCount} reviews)
                              </span>
                           </div>
                        </div>

                        {/* Property Highlights / Quick Stats */}
                        <div className="d-flex flex-wrap gap-4 py-3 mb-4 border-top border-bottom text-secondary">
                           <div className="d-flex align-items-center">
                              <FaUsers
                                 color="#D02D11"
                                 className="me-2"
                                 size={18}
                              />
                              <span>
                                 <strong>{maxGuests}</strong> Guests
                              </span>
                           </div>
                           <div className="d-flex align-items-center">
                              <FaBed
                                 color="#D02D11"
                                 className="me-2"
                                 size={18}
                              />
                              <span>
                                 <strong>{bedrooms}</strong> {bedroomsText}
                              </span>
                           </div>
                           <div className="d-flex align-items-center">
                              <FaBath
                                 color="#D02D11"
                                 className="me-2"
                                 size={18}
                              />
                              <span>
                                 <strong>{bathrooms}</strong> {bathroomsText}
                              </span>
                           </div>
                        </div>

                        {/* Dynamic Rich Text Description Renderer */}
                        <div className="property-description-body">
                           {description && description.length > 0 ? (
                              description.map((node, index) => {
                                 switch (node.type) {
                                    case "paragraph":
                                       return (
                                          <p
                                             key={index}
                                             className="text-secondary mb-3 leading-relaxed"
                                          >
                                             {renderChildrenText(node.children)}
                                          </p>
                                       );

                                    case "list":
                                       return (
                                          <ul
                                             key={index}
                                             className="list-unstyled mb-3"
                                          >
                                             {node.children?.map(
                                                (item, itemIdx) => (
                                                   <li
                                                      key={itemIdx}
                                                      className="d-flex align-items-start mb-2"
                                                   >
                                                      {getListItemIcon(
                                                         item.children,
                                                         itemIdx,
                                                      )}
                                                      <span className="fw-medium text-dark">
                                                         {renderChildrenText(
                                                            item.children,
                                                         )}
                                                      </span>
                                                   </li>
                                                ),
                                             )}
                                          </ul>
                                       );

                                    default:
                                       return null;
                                 }
                              })
                           ) : (
                              <p className="text-muted">
                                 No description available for this property.
                              </p>
                           )}
                        </div>
                     </Card.Body>
                  </Card>
               </Col>
            </Row>
         </Container>
      </section>
   );
};

export default PropertyDescription;
