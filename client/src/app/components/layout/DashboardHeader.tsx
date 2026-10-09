"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar, Container, Dropdown, Button } from "react-bootstrap";
import { useAuth } from "@/context/AuthContext";
import { MdOutlineMenu } from "react-icons/md";
import { FaRegCircleUser } from "react-icons/fa6";
import { CiGlobe } from "react-icons/ci";
import LanguageCurrencyModal from "@/app/components/common/LanguageCurrencyModal";

interface StrapiMediaFormat {
   url: string;
}

interface UserWithAvatar {
   id: number;
   username: string;
   email: string;
   avatar?: StrapiMediaFormat | StrapiMediaFormat[];
}

export default function DashboardHeader() {
   const { user, logout } = useAuth();
   const [showLangModal, setShowLangModal] = useState(false);

   // Safely type user with avatar interface inside component body
   const typedUser = user as unknown as UserWithAvatar | null;
   const avatarSource = Array.isArray(typedUser?.avatar)
      ? typedUser?.avatar[0]?.url
      : typedUser?.avatar?.url;

   const rawAvatarUrl = avatarSource
      ? avatarSource.startsWith("http")
         ? avatarSource
         : `${process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"}${avatarSource}`
      : null;

   return (
      <section>
         <Navbar className="bg-white border-bottom py-3 fixed-top shadow-sm">
            <Container className="d-flex align-items-center justify-content-between">
               {/* Brand Logo */}
               <Navbar.Brand
                  as={Link}
                  href="/"
                  className="fw-bold fs-3 text-dark mb-0"
               >
                  Restify<span className="text-danger">.</span>
               </Navbar.Brand>

               {/* Right Action Icons */}
               <div className="d-flex align-items-center gap-2">
                  {/* Globe Icon Trigger for Language Modal */}
                  <Button
                     variant="link"
                     className="text-dark border-0 rounded-circle p-2 hover-bg-light"
                     onClick={() => setShowLangModal(true)}
                     aria-label="Language and Currency Settings"
                  >
                     <CiGlobe color="#000" size={22} />
                  </Button>

                  {/* Account Options Dropdown (Pill Button) */}
                  <Dropdown align="end">
                     <Dropdown.Toggle
                        variant="light"
                        id="user-menu-dropdown"
                        className="d-flex align-items-center gap-2 border rounded-pill px-3 py-1 bg-white shadow-sm no-caret"
                     >
                        <MdOutlineMenu color="#222" size={20} />
                        <div
                           className="position-relative rounded-circle overflow-hidden bg-dark text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                           style={{
                              width: "28px",
                              height: "28px",
                              fontSize: "0.8rem",
                           }}
                        >
                           {rawAvatarUrl ? (
                              <Image
                                 src={rawAvatarUrl}
                                 alt={user?.username || "User"}
                                 fill
                                 className="object-fit-cover"
                                 unoptimized
                              />
                           ) : user?.username ? (
                              user.username[0].toUpperCase()
                           ) : (
                              <FaRegCircleUser color="#fff" size={16} />
                           )}
                        </div>
                     </Dropdown.Toggle>

                     <Dropdown.Menu
                        className="shadow-lg border-0 rounded-4 mt-2 py-2"
                        style={{ width: "240px" }}
                     >
                        <Dropdown.Item
                           as={Link}
                           href="/dashboard/wishlist"
                           className="py-2 d-flex align-items-center gap-3"
                        >
                           <i className="bi bi-heart fs-5"></i> Wish lists
                        </Dropdown.Item>
                        <Dropdown.Item
                           as={Link}
                           href="/dashboard/trips"
                           className="py-2 d-flex align-items-center gap-3"
                        >
                           <i className="bi bi-luggage fs-5"></i> Trips
                        </Dropdown.Item>
                        <Dropdown.Item
                           as={Link}
                           href="/dashboard/messages"
                           className="py-2 d-flex align-items-center gap-3"
                        >
                           <i className="bi bi-chat-left-text fs-5"></i>{" "}
                           Messages
                        </Dropdown.Item>
                        <Dropdown.Item
                           as={Link}
                           href="/dashboard/profile"
                           className="py-2 d-flex align-items-center gap-3"
                        >
                           <i className="bi bi-person fs-5"></i> Profile
                        </Dropdown.Item>

                        <Dropdown.Divider />

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
                           <i className="bi bi-question-circle fs-5"></i> Help
                           Center
                        </Dropdown.Item>

                        <Dropdown.Divider />

                        <Dropdown.Item
                           onClick={logout}
                           className="py-2 text-danger fw-medium"
                        >
                           Log out
                        </Dropdown.Item>
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
      </section>
   );
}
