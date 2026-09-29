import DatePicker from "@/app/components/common/DatePicker";
import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { DateRange } from "react-day-picker";

const SelectDates = () => {
   const [dates, setDates] = useState<DateRange | undefined>(undefined);

   return (
      <section className="my-5">
         <Container>
            <Row>
               <Col lg={8}>
                  <div className="mb-4">
                     <h3 className="fw-bold">Select check-in dates</h3>
                  </div>
                  <DatePicker onDateChange={(range) => setDates(range)} />
               </Col>
            </Row>
         </Container>
      </section>
   );
};

export default SelectDates;
