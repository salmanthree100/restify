"use client";

import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { PropertyCard } from "./PropertyCard";
import { Property } from "@/app/types";

interface PropertyGridProps {
   properties: Property[];
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({ properties }) => {
   if (!properties || properties.length === 0) {
      return (
         <Container className="py-5 text-center">
            <h5 className="fw-semibold text-secondary">No properties found</h5>
            <p className="text-muted small">
               Try adjusting your destination or filter options.
            </p>
         </Container>
      );
   }

   return (
      <section style={{ margin: "100px 0" }}>
         <Container fluid="xl" className="py-4">
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
               {properties.map((property) => (
                  <Col key={property.id}>
                     <PropertyCard property={property} />
                  </Col>
               ))}
            </Row>
         </Container>
      </section>
   );
};
