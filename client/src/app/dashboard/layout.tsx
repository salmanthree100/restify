"use client";

import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import TripsHeader from "@/app/dashboard/trips/components/TripsHeader"; // Or from @/app/dashboard/components

export default function DashboardLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <section style={{ margin: "100px 0 60px" }}>
         <Container>
            <Row className="g-4">
               {/* Persistent Sidebar */}
               <Col lg={3}>
                  <TripsHeader />
               </Col>

               {/* Dynamic Page View (Trips, Profile, Wishlist, etc.) */}
               <Col lg={9}>{children}</Col>
            </Row>
         </Container>
      </section>
   );
}
