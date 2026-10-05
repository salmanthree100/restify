"use client";

import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";

interface Props {
   onNext: (message: string) => void;
}

export default function HostMessageStep({ onNext }: Props) {
   const [message, setMessage] = useState("");

   return (
      <div className="py-3">
         <h5 className="fw-bold mb-3">3. Write a message to the host</h5>
         <p className="text-muted small mb-2">
            Share a bit about yourself and why you&apos;re visiting.
         </p>
         <Form.Control
            as="textarea"
            rows={4}
            className="mb-3"
            placeholder="Hello! We are excited to stay at your property..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
         />
         <Button
            variant="dark"
            className="px-4"
            onClick={() => onNext(message)}
         >
            Next
         </Button>
      </div>
   );
}
