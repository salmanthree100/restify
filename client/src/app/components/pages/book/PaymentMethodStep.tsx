"use client";

import React, { useState } from "react";
import {
   CardElement,
   useStripe,
   useElements,
   Elements,
} from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { Button, Form, Spinner } from "react-bootstrap";

export interface PaymentDetails {
   paymentMethodId: string;
}

interface PaymentMethodStepProps {
   onNext: (details: PaymentDetails) => void;
}

function CheckoutForm({ onNext }: PaymentMethodStepProps) {
   const stripe = useStripe();
   const elements = useElements();
   const [error, setError] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setLoading(true);
      setError(null);

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return;

      // Create Payment Method using Stripe Test Cards
      const { error: stripeError, paymentMethod } =
         await stripe.createPaymentMethod({
            type: "card",
            card: cardElement,
         });

      setLoading(false);

      if (stripeError) {
         setError(stripeError.message || "Payment processing failed");
      } else if (paymentMethod) {
         onNext({ paymentMethodId: paymentMethod.id });
      }
   };

   return (
      <Form onSubmit={handleSubmit} className="py-3">
         <h5 className="fw-bold mb-3">Pay with Card</h5>

         <div className="p-3 border rounded-3 mb-3 bg-white">
            <CardElement
               options={{
                  style: {
                     base: {
                        fontSize: "16px",
                        color: "#424770",
                        "::placeholder": { color: "#aab7c4" },
                     },
                     invalid: { color: "#9e2146" },
                  },
               }}
            />
         </div>

         {error && <div className="text-danger mb-3 small">{error}</div>}

         <Button
            type="submit"
            variant="dark"
            disabled={!stripe || loading}
            className="w-100 py-2 fw-semibold"
         >
            {loading ? (
               <Spinner animation="border" size="sm" />
            ) : (
               "Save Payment Details"
            )}
         </Button>
      </Form>
   );
}

export default function PaymentMethodStep({ onNext }: PaymentMethodStepProps) {
   return (
      <Elements stripe={stripePromise}>
         <CheckoutForm onNext={onNext} />
      </Elements>
   );
}
