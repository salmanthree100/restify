"use client";

import { useState, useEffect, CSSProperties } from "react";
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
import {
   US,
   GB,
   FR,
   DE,
   JP,
   ES,
   IT,
   KR,
   EU,
} from "country-flag-icons/react/3x2";
import { useCurrency } from "@/context/CurrencyContext";
import { StrapiCurrency } from "@/app/types";
import { useLocale, SupportedLocale } from "@/context/LocaleContext";

interface EnhancedLanguageItem {
   code: string;
   name: string;
   region: string;
   flagCode: string;
   FlagComponent: React.ComponentType<{
      className?: string;
      style?: CSSProperties;
   }>;
}

const LANGUAGES: EnhancedLanguageItem[] = [
   {
      code: "en-US",
      name: "English",
      region: "United States",
      flagCode: "US",
      FlagComponent: US,
   },
   {
      code: "en-GB",
      name: "English",
      region: "United Kingdom",
      flagCode: "GB",
      FlagComponent: GB,
   },
   {
      code: "fr-FR",
      name: "French",
      region: "France",
      flagCode: "FR",
      FlagComponent: FR,
   },
   {
      code: "de-DE",
      name: "German",
      region: "Germany",
      flagCode: "DE",
      FlagComponent: DE,
   },
   {
      code: "ja-JP",
      name: "Japanese",
      region: "Japan",
      flagCode: "JP",
      FlagComponent: JP,
   },
   {
      code: "es-ES",
      name: "Spanish",
      region: "Spain",
      flagCode: "ES",
      FlagComponent: ES,
   },
   {
      code: "it-IT",
      name: "Italian",
      region: "Italy",
      flagCode: "IT",
      FlagComponent: IT,
   },
   {
      code: "ko-KR",
      name: "Korean",
      region: "South Korea",
      flagCode: "KR",
      FlagComponent: KR,
   },
];

const DEFAULT_CURRENCIES: StrapiCurrency[] = [
   { name: "USD", symbol: "$", currencyCode: "USD" },
   { name: "Euro", symbol: "€", currencyCode: "EUR" },
   { name: "British Pound", symbol: "£", currencyCode: "GBP" },
];

// Map currency codes to their respective flag component
const CURRENCY_FLAG_MAP: Record<
   string,
   React.ComponentType<{ className?: string; style?: CSSProperties }>
> = {
   USD: US,
   EUR: EU,
   GBP: GB,
   JPY: JP,
   KRW: KR,
};

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
      const code = fullCode.split("-")[0];

      const validLocales: SupportedLocale[] = [
         "en",
         "es",
         "fr",
         "de",
         "it",
         "ja",
         "ko",
      ];

      if (validLocales.includes(code as SupportedLocale)) {
         setLocale(code as SupportedLocale);
      } else {
         setLocale("en");
      }
   };

   const [strapiCurrencies, setStrapiCurrencies] = useState<StrapiCurrency[]>(
      [],
   );

   const filteredLanguages = LANGUAGES.filter(
      (l) =>
         l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         l.region.toLowerCase().includes(searchQuery.toLowerCase()),
   );

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

            <Container fluid className="px-0">
               <Row className="g-3">
                  {activeTab === "language"
                     ? filteredLanguages.map((item: EnhancedLanguageItem) => {
                          const isSelected = locale === item.code.split("-")[0];
                          const Flag = item.FlagComponent;
                          return (
                             <Col xs={6} sm={4} md={3} lg={2} key={item.code}>
                                <Button
                                   variant="light"
                                   onClick={() =>
                                      handleLanguageSelect(item.code)
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
                                   <div className="text-muted extra-small d-flex align-items-center gap-1 mt-1">
                                      <Flag
                                         style={{
                                            width: "16px",
                                            height: "12px",
                                            borderRadius: "2px",
                                         }}
                                      />
                                      <span>
                                         {item.flagCode} {item.region}
                                      </span>
                                   </div>
                                </Button>
                             </Col>
                          );
                       })
                     : filteredCurrencies.map(
                          (item: StrapiCurrency, index: number) => {
                             const isSelected = currency === item.currencyCode;
                             // Lookup flag component or default to undefined
                             const CurrencyFlag =
                                CURRENCY_FLAG_MAP[item.currencyCode];

                             return (
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
                                      <div className="text-muted extra-small d-flex align-items-center gap-1 mt-1">
                                         {CurrencyFlag && (
                                            <CurrencyFlag
                                               style={{
                                                  width: "16px",
                                                  height: "12px",
                                                  borderRadius: "2px",
                                               }}
                                            />
                                         )}
                                         <span>
                                            {item.currencyCode} - {item.symbol}
                                         </span>
                                      </div>
                                   </Button>
                                </Col>
                             );
                          },
                       )}
               </Row>
            </Container>
         </Modal.Body>

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
