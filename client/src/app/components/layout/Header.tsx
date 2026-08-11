// src/components/Header.tsx
"use client";

import { useState, useEffect } from "react";
import { Navbar, Container, Nav, Dropdown, Button } from "react-bootstrap";
import Link from "next/link";
import LanguageCurrencyModal from "@/app/components/common/LanguageCurrencyModal";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import { getStrapiMedia } from "@/lib/utils";
import Image from "next/image";
import { HeaderData } from "@/types";

export default function Header() {
   const [showLangModal, setShowLangModal] = useState(false);
   const [isLoggedIn, setIsLoggedIn] = useState(true); // Toggle based on your Auth state
   const { locale, setLocale } = useLocale();
   const [headerData, setHeaderData] = useState<HeaderData | null>(null);

   const query = qs.stringify(
      {
         locale, // Handles Strapi i18n
         populate: {
            header: {
               populate: {
                  logo: true,
                  headerLinks: true,
               },
            },
         },
      },
      { encodeValuesOnly: true },
   );

   useEffect(() => {
      const fetchHeader = async () => {
         const response = await fetch(`/api/strapi/global?${query}`);
         const data = await response.json();
         console.log(data?.data?.header);
         setHeaderData(data?.data?.header);
      };
      fetchHeader();
   }, [query]);

   return (
      <>
         <Navbar
            expand="md"
            className="bg-dark navbar-dark border-bottom border-secondary py-2"
         >
            <Container fluid className="px-4">
               {/* Logo */}
               <Navbar.Brand href="/" className="fw-bold fs-3 text-white">
                  {headerData?.logo?.url && (
                     <Image
                        src={getStrapiMedia(headerData.logo.url) ?? ""}
                        width={headerData.logo.width || 120}
                        height={headerData.logo.height || 40}
                        alt={
                           headerData.logo.alternativeText ||
                           headerData.logo.name ||
                           "Restify Logo"
                        }
                     />
                  )}
               </Navbar.Brand>

               {/* Centered Nav Links */}
               <Nav className="mx-auto d-none d-md-flex gap-4">
                  <Nav.Link
                     as={Link}
                     href="/destinations"
                     className="text-white fw-medium"
                  >
                     Destinations
                  </Nav.Link>
                  <Nav.Link
                     as={Link}
                     href="/experiences"
                     className="text-white fw-medium"
                  >
                     Experiences
                  </Nav.Link>
                  <Nav.Link
                     as={Link}
                     href="/help"
                     className="text-white fw-medium"
                  >
                     Help
                  </Nav.Link>
                  <Nav.Link
                     as={Link}
                     href="/host"
                     className="text-white fw-medium"
                  >
                     Host
                  </Nav.Link>
               </Nav>

               {/* Right Action Icons */}
               <div className="d-flex align-items-center gap-2">
                  {/* Globe Icon Trigger for Language Modal */}
                  <Button
                     variant="link"
                     className="text-white p-2 border-0 rounded-circle"
                     onClick={() => setShowLangModal(true)}
                     aria-label="Language and Currency Settings"
                  >
                     <i className="bi bi-globe fs-5"></i>
                  </Button>

                  {/* Account Options Dropdown (Pill Button) */}
                  <Dropdown align="end">
                     <Dropdown.Toggle
                        variant="outline-light"
                        id="user-menu-dropdown"
                        className="rounded-pill px-3 py-1 d-flex align-items-center gap-2 border-secondary bg-transparent"
                     >
                        <i className="bi bi-person-circle fs-5"></i>
                        <i className="bi bi-list fs-5"></i>
                     </Dropdown.Toggle>

                     <Dropdown.Menu
                        className="shadow-lg border-0 rounded-4 mt-2 py-2"
                        style={{ width: "240px" }}
                     >
                        {isLoggedIn ? (
                           <>
                              <Dropdown.Item
                                 as={Link}
                                 href="/wishlists"
                                 className="py-2 d-flex align-items-center gap-3"
                              >
                                 <i className="bi bi-heart fs-5"></i> Wish lists
                              </Dropdown.Item>
                              <Dropdown.Item
                                 as={Link}
                                 href="/trips"
                                 className="py-2 d-flex align-items-center gap-3"
                              >
                                 <i className="bi bi-luggage fs-5"></i> Trips
                              </Dropdown.Item>
                              <Dropdown.Item
                                 as={Link}
                                 href="/messages"
                                 className="py-2 d-flex align-items-center gap-3"
                              >
                                 <i className="bi bi-chat-left-text fs-5"></i>{" "}
                                 Messages
                              </Dropdown.Item>
                              <Dropdown.Item
                                 as={Link}
                                 href="/profile"
                                 className="py-2 d-flex align-items-center gap-3"
                              >
                                 <i className="bi bi-person fs-5"></i> Profile
                              </Dropdown.Item>

                              <Dropdown.Divider />

                              <Dropdown.Item
                                 as={Link}
                                 href="/account"
                                 className="py-2 d-flex align-items-center gap-3"
                              >
                                 <i className="bi bi-gear fs-5"></i> Account
                                 settings
                              </Dropdown.Item>
                              <Dropdown.Item
                                 onClick={() => setShowLangModal(true)}
                                 className="py-2 d-flex align-items-center gap-3"
                              >
                                 <i className="bi bi-globe fs-5"></i> Language &
                                 currency
                              </Dropdown.Item>
                              <Dropdown.Item
                                 as={Link}
                                 href="/help"
                                 className="py-2 d-flex align-items-center gap-3"
                              >
                                 <i className="bi bi-question-circle fs-5"></i>{" "}
                                 Help Center
                              </Dropdown.Item>

                              <Dropdown.Divider />

                              <div className="px-3 py-2">
                                 <div className="fw-bold small">
                                    Become a host
                                 </div>
                                 <div className="text-muted extra-small">
                                    It is easy to start hosting and earn extra
                                    income.
                                 </div>
                              </div>
                              <Dropdown.Item
                                 as={Link}
                                 href="/refer-host"
                                 className="py-2"
                              >
                                 Refer a Host
                              </Dropdown.Item>
                              <Dropdown.Item
                                 as={Link}
                                 href="/find-cohost"
                                 className="py-2"
                              >
                                 Find a co-host
                              </Dropdown.Item>

                              <Dropdown.Divider />

                              <Dropdown.Item
                                 onClick={() => setIsLoggedIn(false)}
                                 className="py-2 text-dark"
                              >
                                 Log out
                              </Dropdown.Item>
                           </>
                        ) : (
                           <>
                              <Dropdown.Item
                                 as={Link}
                                 href="/login"
                                 className="fw-bold py-2"
                              >
                                 Log in
                              </Dropdown.Item>
                              <Dropdown.Item
                                 as={Link}
                                 href="/signup"
                                 className="py-2"
                              >
                                 Sign up
                              </Dropdown.Item>
                           </>
                        )}
                     </Dropdown.Menu>
                  </Dropdown>
               </div>
            </Container>
         </Navbar>

         {/* Language & Currency Modal */}
         <LanguageCurrencyModal
            show={showLangModal}
            onHide={() => setShowLangModal(false)}
         />
      </>
   );
}
