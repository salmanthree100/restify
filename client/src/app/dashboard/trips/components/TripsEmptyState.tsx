import React from "react";
import Link from "next/link";
import { BsLuggage } from "react-icons/bs";
import { BiSearch } from "react-icons/bi";

const TripsEmptyState = () => {
   return (
      <div className="text-center py-5 my-4">
         <div className="mb-4">
            <div
               className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle mb-2"
               style={{ width: "96px", height: "96px" }}
            >
               <BsLuggage
                  className="text-secondary"
                  style={{ fontSize: "150px" }}
               />
            </div>
         </div>
         <h4 className="fw-bold mb-2 text-dark">
            You haven&apos;t booked any stays yet.
         </h4>
         <p className="text-muted small mb-4">
            Explore and book your next Place now!
         </p>
         <Link
            href="/"
            className="btn btn-dark rounded-pill px-4 py-2 fw-medium d-inline-flex align-items-center gap-2 text-decoration-none shadow-sm"
         >
            <BiSearch className="fs-5" /> Find your next getaway
         </Link>
      </div>
   );
};

export default TripsEmptyState;
