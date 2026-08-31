// src/components/Header.tsx
"use client";

import { useState, useEffect } from "react";
import { Navbar, Container, Nav, Dropdown, Button } from "react-bootstrap";
import Link from "next/link";
import LanguageCurrencyModal from "@/app/components/common/LanguageCurrencyModal";
import AuthModal from "@/app/components/auth/AuthModal";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/context/AuthContext";
import { getStrapiMedia } from "@/lib/utils";
import Image from "next/image";
import { HeaderData } from "@/app/types";
import styles from "./Header.module.css";
import { MdOutlineMenu } from "react-icons/md";
import { FaRegCircleUser } from "react-icons/fa6";
import { CiGlobe } from "react-icons/ci";

export default function Header() {
   const [showLangModal, setShowLangModal] = useState(false);
   const [showAuthModal, setShowAuthModal] = useState(false);

   // Consume authentication state from AuthContext
   const { user, logout } = useAuth();
   const isLoggedIn = Boolean(user);

   const { locale } = useLocale();
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
         setHeaderData(data?.data?.header);
      };
      fetchHeader();
   }, [query]);

   return (
      <section>
         <Navbar expand="md" className={`${styles.container} py-2 fixed-top`}>
            <Container>
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
                  {headerData?.headerLinks?.map((link) => (
                     <Nav.Link
                        key={link?.id}
                        as={Link}
                        href={link?.url}
                        className="text-white fw-normal"
                     >
                        {link?.label}
                     </Nav.Link>
                  ))}
               </Nav>

               {/* Right Action Icons */}
               <div className="d-flex align-items-center gap-2">
                  {/* Globe Icon Trigger for Language Modal */}
                  <Button
                     variant="link"
                     className="text-white border-0 rounded-circle"
                     onClick={() => setShowLangModal(true)}
                     aria-label="Language and Currency Settings"
                  >
                     <CiGlobe color="#fff" size={20} />
                  </Button>

                  {/* Account Options Dropdown (Pill Button) */}
                  <Dropdown align="end">
                     <Dropdown.Toggle
                        variant="outline-light"
                        id="user-menu-dropdown"
                        className="d-flex align-items-center gap-1 border-0 bg-transparent"
                     >
                        <FaRegCircleUser color="#fff" size={20} />
                        <MdOutlineMenu color="#fff" size={20} />
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
                                 onClick={logout}
                                 className="py-2 text-dark"
                              >
                                 Log out
                              </Dropdown.Item>
                           </>
                        ) : (
                           <>
                              <Dropdown.Item
                                 onClick={() => setShowAuthModal(true)}
                                 className="fw-bold py-2"
                              >
                                 Log in or Signup
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

         {/* Authentication Modal */}
         <AuthModal
            show={showAuthModal}
            onHide={() => setShowAuthModal(false)}
         />
      </section>
   );
}
