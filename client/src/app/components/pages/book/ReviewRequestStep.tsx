"use client";

import React from "react";
import { Button } from "react-bootstrap";

interface Props {
   onConfirm: () => void;
   isSubmitting: boolean;
}

export default function ReviewRequestStep({ onConfirm, isSubmitting }: Props) {
   return (
      <div className="py-3">
         <h5 className="fw-bold mb-3">4. Review your request</h5>
         <p className="text-muted small mb-3">
            By selecting the button below, you agree to the Host&apos;s House
            Rules, Ground rules for guests, and Restify Terms of Service.
         </p>
         <Button
            variant="danger"
            size="lg"
            className="px-5 fw-bold"
            style={{ backgroundColor: "#E53935" }}
            disabled={isSubmitting}
            onClick={onConfirm}
         >
            {isSubmitting ? "Processing..." : "Confirm and Pay"}
         </Button>
      </div>
   );
}
