import React, { useState } from "react";
import { Container, Row, Col, Nav, Button } from "react-bootstrap";
import { DayPicker, DateRange } from "react-day-picker";

// Core styles
import "react-day-picker/dist/style.css";

// Define type aliases for the bottom tolerance choices
type ToleranceSetting =
   | "exact"
   | "1day"
   | "2days"
   | "3days"
   | "7days"
   | "14days";
type TabSetting = "dates" | "months" | "flexible";

interface ToleranceChip {
   id: ToleranceSetting;
   label: string;
}

// 1. Define the props interface for the callback
interface DatePickerProps {
   onDateChange: (range: DateRange | undefined) => void;
}

export default function DatePicker({
   onDateChange,
}: DatePickerProps): React.JSX.Element {
   const [activeTab, setActiveTab] = useState<TabSetting>("dates");
   const [selectedRange, setSelectedRange] = useState<DateRange | undefined>({
      from: undefined,
      to: undefined,
   });
   const [tolerance, setTolerance] = useState<ToleranceSetting>("exact");

   // Greys out historical or placeholder dates matching your image sample (Sept 7, 2026)
   const pastDisabledThreshold: Date = new Date();

   const toleranceChips: ToleranceChip[] = [
      { id: "exact", label: "Exact dates" },
      { id: "1day", label: "± 1 day" },
      { id: "2days", label: "± 2 days" },
      { id: "3days", label: "± 3 days" },
      { id: "7days", label: "± 7 days" },
      { id: "14days", label: "± 14 days" },
   ];

   //  Handle selection and broadcast updates up to the parent component
   const handleSelect = (range: DateRange | undefined) => {
      setSelectedRange(range);
      onDateChange(range); // Sends updates to parent instantly
   };

   return (
      <Container
         className="p-4 bg-white rounded-4 border shadow-sm"
         style={{ maxWidth: "880px", marginTop: "5px" }}
      >
         {/* 1. Top Mode Switching Bar */}
         <Row className="justify-content-center mb-4">
            <Col xs="auto">
               <Nav
                  variant="pills"
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k as TabSetting)}
                  className="bg-light rounded-pill p-1"
               >
                  <Nav.Item>
                     <Nav.Link
                        eventKey="dates"
                        className={`rounded-pill px-4 ${activeTab === "dates" ? "bg-white text-dark shadow-sm" : "text-secondary"}`}
                     >
                        Dates
                     </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                     <Nav.Link
                        eventKey="months"
                        className={`rounded-pill px-4 ${activeTab === "months" ? "bg-white text-dark shadow-sm" : "text-secondary"}`}
                     >
                        Months
                     </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                     <Nav.Link
                        eventKey="flexible"
                        className={`rounded-pill px-4 ${activeTab === "flexible" ? "bg-white text-dark shadow-sm" : "text-secondary"}`}
                     >
                        Flexible
                     </Nav.Link>
                  </Nav.Item>
               </Nav>
            </Col>
         </Row>

         {/* 2. Side-By-Side Multi-Month Grid Engine */}
         <Row className="justify-content-center">
            <Col className="d-flex justify-content-center">
               <DayPicker
                  mode="range"
                  numberOfMonths={2}
                  defaultMonth={new Date(2026, 8)} // Anchor calendar explicitly to Sep 2026
                  selected={selectedRange}
                  onSelect={handleSelect}
                  disabled={{ before: pastDisabledThreshold }}
               />
            </Col>
         </Row>

         {/* 3. Bottom Tolerance Modifiers Row */}
         <Row className="mt-4 pt-3 border-top justify-content-start align-items-center g-2">
            <Col xs="auto">
               <div className="d-flex flex-wrap gap-2">
                  {toleranceChips.map((chip) => (
                     <Button
                        key={chip.id}
                        className="rounded-pill px-3 py-1 btn-sm border-secondary text-dark"
                        style={{
                           borderColor:
                              tolerance === chip.id ? "#222222" : "#dee2e6",
                           borderWidth: "1px",
                           backgroundColor:
                              tolerance === chip.id ? "#f7f7f7" : "transparent",
                           fontWeight: tolerance === chip.id ? "500" : "400",
                        }}
                        onClick={() => setTolerance(chip.id)}
                     >
                        {chip.label}
                     </Button>
                  ))}
               </div>
            </Col>
         </Row>
      </Container>
   );
}
