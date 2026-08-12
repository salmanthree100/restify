"use client";

import { useState, useEffect } from "react";
import {
   Modal,
   Nav,
   Form,
   InputGroup,
   Container,
   Row,
   Col,
   Button,
} from "react-bootstrap";
import { useCurrency } from "@/context/CurrencyContext";
import { StrapiCurrency, LanguageItem } from "@/app/types";
import { useLocale } from "@/context/LocaleContext";

const LANGUAGES: LanguageItem[] = [
   { code: "en-US", name: "English", region: "United States", flag: "🇺🇸" },
   { code: "en-GB", name: "English", region: "United Kingdom", flag: "🇬🇧" },
   { code: "fr-FR", name: "French", region: "France", flag: "🇫🇷" },
   { code: "de-DE", name: "German", region: "Germany", flag: "🇩🇪" },
   { code: "ja-JP", name: "Japanese", region: "Japan", flag: "🇯🇵" },
   { code: "es-ES", name: "Spanish", region: "Spain", flag: "🇪🇸" },
   { code: "it-IT", name: "Italian", region: "Italy", flag: "🇮🇹" },
   { code: "ko-KR", name: "Korean", region: "South Korea", flag: "🇰🇷" },
];

const DEFAULT_CURRENCIES: StrapiCurrency[] = [
   { name: "USD", symbol: "$", currencyCode: "USD" },
   { name: "Euro", symbol: "€", currencyCode: "EUR" },
   { name: "British Pound", symbol: "£", currencyCode: "GBP" },
];

interface ModalProps {
   show: boolean;
   onHide: () => void;
}

export default function LanguageCurrencyModal({ show, onHide }: ModalProps) {
   const [activeTab, setActiveTab] = useState<"language" | "currency">(
      "language",
   );
   const [searchQuery, setSearchQuery] = useState("");
   const [autoTranslate, setAutoTranslate] = useState(true);

   const { currency, setCurrency } = useCurrency();
   const { locale, setLocale } = useLocale();

   const handleLanguageSelect = (fullCode: string) => {
      // Converts "en-US" -> "en", "fr-FR" -> "fr", "ja-JP" -> "ja"
      const strapiLocale = fullCode.split("-")[0];
      setLocale(strapiLocale);
   };

   // 1. Properly type state as an array: StrapiCurrency[]
   const [strapiCurrencies, setStrapiCurrencies] = useState<StrapiCurrency[]>(
      [],
   );

   // 2. Safely filter languages
   const filteredLanguages = LANGUAGES.filter(
      (l) =>
         l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         l.region.toLowerCase().includes(searchQuery.toLowerCase()),
   );

   // 3. Use Strapi currencies if loaded, otherwise fallback to defaults
   const currencyList =
      strapiCurrencies.length > 0 ? strapiCurrencies : DEFAULT_CURRENCIES;

   const filteredCurrencies = currencyList.filter(
      (c) =>
         c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         c.currencyCode.toLowerCase().includes(searchQuery.toLowerCase()),
   );

   useEffect(() => {
      const fetchCurrencies = async () => {
         try {
            const response = await fetch("/api/strapi/currencies");
            const data = await response.json();
            // Strapi v4/v5 format check
            if (Array.isArray(data?.data)) {
               setStrapiCurrencies(data.data);
            }
         } catch (error) {
            console.error("Failed to fetch currencies:", error);
         }
      };
      fetchCurrencies();
   }, []);

   return (
      <Modal
         show={show}
         onHide={onHide}
         size="xl"
         centered
         scrollable
         className="rounded-4"
      >
         <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="w-100 text-center h6 fw-normal">
               Language & Currency
            </Modal.Title>
         </Modal.Header>

         <Modal.Body className="pt-2 px-4">
            {/* Navigation Tabs and Search */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-4 gap-3">
               <Nav
                  variant="underline"
                  activeKey={activeTab}
                  onSelect={(k) =>
                     setActiveTab((k as "language" | "currency") || "language")
                  }
               >
                  <Nav.Item>
                     <Nav.Link
                        eventKey="language"
                        className={`fw-semibold ${activeTab === "language" ? "text-danger" : "text-dark"}`}
                     >
                        Language & Region
                     </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                     <Nav.Link
                        eventKey="currency"
                        className={`fw-semibold ${activeTab === "currency" ? "text-danger" : "text-dark"}`}
                     >
                        Currency
                     </Nav.Link>
                  </Nav.Item>
               </Nav>

               <InputGroup
                  style={{ maxWidth: "260px" }}
                  className="rounded-pill border"
               >
                  <InputGroup.Text className="bg-transparent border-0 pe-1">
                     <i className="bi bi-search text-muted"></i>
                  </InputGroup.Text>
                  <Form.Control
                     type="text"
                     placeholder={
                        activeTab === "language"
                           ? "Search your region"
                           : "Search your currency"
                     }
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="border-0 shadow-none bg-transparent ps-1"
                  />
               </InputGroup>
            </div>

            {/* Content Grids */}
            <Container fluid className="px-0">
               <Row className="g-3">
                  {activeTab === "language"
                     ? filteredLanguages.map((item: LanguageItem) => {
                          // Check active selection against current locale
                          const isSelected = locale === item.code.split("-")[0];
                          return (
                             <Col xs={6} sm={4} md={3} lg={2} key={item.code}>
                                <Button
                                   variant="light"
                                   onClick={() =>
                                      handleLanguageSelect(item.code)
                                   } // <--- Calls our new function
                                   className={`w-100 text-start p-3 rounded-3 border-0 ${
                                      isSelected
                                         ? "bg-light border border-dark border-2"
                                         : "bg-transparent"
                                   }`}
                                >
                                   <div className="fw-semibold text-dark small">
                                      {item.name}
                                   </div>
                                   <div className="text-muted extra-small">
                                      {item.flag} {item.region}
                                   </div>
                                </Button>
                             </Col>
                          );
                       })
                     : filteredCurrencies.map(
                          (item: StrapiCurrency, index: number) => {
                             const isSelected = currency === item.currencyCode;
                             return (
                                // Unique key combination using currencyCode + index
                                <Col
                                   xs={6}
                                   sm={4}
                                   md={3}
                                   lg={2}
                                   key={`${item.currencyCode}-${index}`}
                                >
                                   <Button
                                      variant="light"
                                      onClick={() =>
                                         setCurrency(item.currencyCode)
                                      }
                                      className={`w-100 text-start p-3 rounded-3 border-0 ${
                                         isSelected
                                            ? "bg-light border border-dark border-2"
                                            : "bg-transparent"
                                      }`}
                                   >
                                      <div className="fw-semibold text-dark small">
                                         {item.name}
                                      </div>
                                      <div className="text-muted extra-small">
                                         {item.currencyCode} - {item.symbol}
                                      </div>
                                   </Button>
                                </Col>
                             );
                          },
                       )}
               </Row>
            </Container>
         </Modal.Body>

         {/* Footer Switch for Auto-Translation */}
         <Modal.Footer className="border-0 bg-light p-3 d-flex justify-content-between align-items-center rounded-bottom-4">
            <div className="d-flex align-items-center gap-2">
               <i className="bi bi-translate fs-5 text-dark"></i>
               <div>
                  <div className="fw-semibold small">Translation</div>
                  <div className="text-muted extra-small">
                     Automatically translate descriptions and reviews to English
                  </div>
               </div>
            </div>
            <Form.Check
               type="switch"
               id="auto-translation-switch"
               checked={autoTranslate}
               onChange={(e) => setAutoTranslate(e.target.checked)}
            />
         </Modal.Footer>
      </Modal>
   );
}
