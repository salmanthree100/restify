"use client";

import React, { useEffect, useState } from "react";
import Nav from "react-bootstrap/Nav";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import { useAuth } from "@/context/AuthContext";
import TripCard, { Trip } from "./components/TripCard";
import TripsEmptyState from "./components/TripsEmptyState";

type TabFilter = "all" | "ongoing" | "upcoming" | "pending" | "cancelled";

export default function UserTripsPage() {
   const { token, user } = useAuth();
   const [trips, setTrips] = useState<Trip[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string>("");
   const [activeTab, setActiveTab] = useState<TabFilter>("all");
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

   // 2. Wrap async fetch inside useEffect to prevent synchronous render state warning
   useEffect(() => {
      let isMounted = true;

      const loadTrips = async () => {
         if (!token || !user) return;
         try {
            setLoading(true);
            const STRAPI_URL =
               process.env.NEXT_PUBLIC_STRAPI_API_URL ||
               "http://localhost:1337";

            const response = await fetch(
               `${STRAPI_URL}/api/users/me?populate[bookings][populate][property][populate]=images`,
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               },
            );

            if (!response.ok) {
               throw new Error("Failed to load trips history.");
            }

            const userData = await response.json();
            if (isMounted) {
               setTrips(userData.bookings || userData.trips || []);
            }
         } catch (err) {
            if (isMounted) {
               setError(
                  err instanceof Error ? err.message : "An error occurred",
               );
            }
         } finally {
            if (isMounted) {
               setLoading(false);
            }
         }
      };

      loadTrips();

      return () => {
         isMounted = false;
      };
   }, [token, user]);

   const filteredTrips = trips.filter((trip) => {
      const today = new Date().toISOString().split("T")[0];
      if (activeTab === "all") return true;
      if (activeTab === "pending") return trip.bookingStatus === "pending";
      if (activeTab === "cancelled") return trip.bookingStatus === "cancelled";
      if (activeTab === "upcoming")
         return trip.bookingStatus === "confirmed" && trip.checkIn > today;
      if (activeTab === "ongoing")
         return (
            trip.bookingStatus === "confirmed" &&
            trip.checkIn <= today &&
            trip.checkOut >= today
         );
      return true;
   });

   return (
      <div className="bg-white rounded-4 border p-4 shadow-sm">
         <h4 className="fw-bold mb-4">Your Trips</h4>

         {/* Navigation Filter Tabs */}
         <Nav
            variant="tabs"
            defaultActiveKey="all"
            className="mb-4"
            onSelect={(selectedKey) =>
               setActiveTab((selectedKey as TabFilter) || "all")
            }
         >
            <Nav.Item>
               <Nav.Link eventKey="all">All Trips</Nav.Link>
            </Nav.Item>
            <Nav.Item>
               <Nav.Link eventKey="ongoing">Ongoing</Nav.Link>
            </Nav.Item>
            <Nav.Item>
               <Nav.Link eventKey="upcoming">Upcoming</Nav.Link>
            </Nav.Item>
            <Nav.Item>
               <Nav.Link eventKey="pending">Pending</Nav.Link>
            </Nav.Item>
            <Nav.Item>
               <Nav.Link eventKey="cancelled">Cancelled</Nav.Link>
            </Nav.Item>
         </Nav>

         {/* Content Rendering */}
         {loading ? (
            <div className="text-center py-5">
               <Spinner animation="border" variant="primary" />
            </div>
         ) : error ? (
            <Alert variant="danger">{error}</Alert>
         ) : filteredTrips.length === 0 ? (
            <TripsEmptyState />
         ) : (
            <div>
               {filteredTrips.map((trip) => (
                  <TripCard
                     key={trip.documentId}
                     trip={trip}
                     onSelect={(t) => setSelectedTrip(t)}
                  />
               ))}
            </div>
         )}
      </div>
   );
}
