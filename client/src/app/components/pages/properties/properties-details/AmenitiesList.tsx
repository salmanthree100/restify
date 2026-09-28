"use client";

import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import * as FaIcons from "react-icons/fa";
import * as LuIcons from "react-icons/lu";
import * as GiIcons from "react-icons/gi";
import * as CgIcons from "react-icons/cg";
import * as TbIcons from "react-icons/tb";
import * as MdIcons from "react-icons/md";
import { IconType } from "react-icons";

// Define the Amenity interface based on Strapi payload structure
export interface Amenity {
   id: number;
   documentId: string;
   name: string;
   category?: string;
   iconName?: string;
}

interface AmenitiesListProps {
   amenities?: Amenity[];
   title?: string;
}

// Map icon prefix to its respective react-icons icon library module
const iconLibraries: Record<string, Record<string, IconType>> = {
   Fa: FaIcons as Record<string, IconType>,
   Lu: LuIcons as Record<string, IconType>,
   Gi: GiIcons as Record<string, IconType>,
   Cg: CgIcons as Record<string, IconType>,
   Tb: TbIcons as Record<string, IconType>,
   Md: MdIcons as Record<string, IconType>,
};

// Dynamic icon lookup helper function
const DynamicIcon = ({ iconName }: { iconName?: string }) => {
   if (!iconName) return null;

   // Extract prefix (e.g., "Fa" from "FaWifi", "Tb" from "TbAirConditioning")
   const prefix = iconName.match(/^[A-Z][a-z]?/)?.[0];

   if (prefix && iconLibraries[prefix] && iconLibraries[prefix][iconName]) {
      const Component = iconLibraries[prefix][iconName];
      return <Component color="#D02D11" className="fs-4 me-2" />;
   }

   // Fallback icon if provided icon name is not found
   return <FaIcons.FaCheckCircle color="#D02D11" className="fs-4 me-2" />;
};

const AmenitiesList: React.FC<AmenitiesListProps> = ({
   amenities = [],
   title = "What this place offers",
}) => {
   if (!amenities || amenities.length === 0) {
      return null;
   }

   return (
      <section className="my-4">
         <Container>
            <h3 className="mb-4 fw-bold">{title}</h3>
            <Row>
               <Col lg={8}>
                  <Row className="g-2">
                     {amenities.map((amenity) => (
                        <Col xs={12} sm={6} md={4} lg={3} key={amenity.id}>
                           <Card className="h-100 border-0 shadow-sm rounded-3">
                              <Card.Body className="d-flex align-items-center p-3">
                                 <DynamicIcon iconName={amenity.iconName} />
                                 <span className="fw-medium text-dark">
                                    {amenity.name}
                                 </span>
                              </Card.Body>
                           </Card>
                        </Col>
                     ))}
                  </Row>
               </Col>
            </Row>
         </Container>
      </section>
   );
};

export default AmenitiesList;
