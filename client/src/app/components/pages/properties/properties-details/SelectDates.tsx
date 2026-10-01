import DatePicker from "@/app/components/common/DatePicker";
import { Container, Row, Col } from "react-bootstrap";
import { useSearch } from "@/context/SearchContext";

const SelectDates = () => {
   const { dates, setDates } = useSearch();

   return (
      <section className="my-5">
         <Container>
            <Row>
               <Col lg={8}>
                  <div className="mb-4">
                     <h3 className="fw-bold">Select check-in dates</h3>
                  </div>
                  <DatePicker
                     selectedRange={dates}
                     onDateChange={(range) => setDates(range)}
                  />
               </Col>
            </Row>
         </Container>
      </section>
   );
};

export default SelectDates;
