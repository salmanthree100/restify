"use client";

import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";

interface Props {
   onNext: (payOption: "full" | "part") => void;
}

export default function PaymentScheduleStep({ onNext }: Props) {
   const [payOption, setPayOption] = useState<"full" | "part">("full");

   return (
      <div className="py-3">
         <h5 className="fw-bold mb-3">1. Choose when to pay</h5>

         <Form.Check
            type="radio"
            id="pay-full"
            name="paymentSchedule"
            className="border rounded-3 p-3 mb-2 cursor-pointer"
            checked={payOption === "full"}
            onChange={() => setPayOption("full")}
            label={
               <div>
                  <strong>Pay in full</strong>
                  <div className="text-muted small">
                     Pay the total amount now.
                  </div>
               </div>
            }
         />

         <Form.Check
            type="radio"
            id="pay-part"
            name="paymentSchedule"
            className="border rounded-3 p-3 mb-3 cursor-pointer"
            checked={payOption === "part"}
            onChange={() => setPayOption("part")}
            label={
               <div>
                  <strong>Pay part now, part later</strong>
                  <div className="text-muted small">
                     Pay a deposit now and the rest automatically later.
                  </div>
               </div>
            }
         />

         <Button
            variant="dark"
            className="px-4"
            onClick={() => onNext(payOption)}
         >
            Next
         </Button>
      </div>
   );
}
