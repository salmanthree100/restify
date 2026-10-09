"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
   HiOutlineUser,
   HiOutlineHeart,
   HiOutlineChatBubbleLeftRight,
   HiOutlineStar,
   HiOutlineDocumentText,
   HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import { BsSuitcase } from "react-icons/bs";

// Define strong types for Strapi avatar
interface StrapiMediaFormat {
   url: string;
}

interface UserWithAvatar {
   id: number;
   username: string;
   email: string;
   avatar?: StrapiMediaFormat | StrapiMediaFormat[];
}

export default function TripsHeader() {
   const { user, logout } = useAuth();
   const pathname = usePathname();

   // Safely cast user to UserWithAvatar
   const typedUser = user as unknown as UserWithAvatar | null;

   // Navigation Links definition with react-icons
   const navItems = [
      { label: "Profile", href: "/dashboard/profile", icon: HiOutlineUser },
      { label: "My Trips", href: "/dashboard/trips", icon: BsSuitcase },
      { label: "Wishlist", href: "/dashboard/wishlist", icon: HiOutlineHeart },
      {
         label: "Messages",
         href: "/dashboard/messages",
         icon: HiOutlineChatBubbleLeftRight,
      },
      { label: "Reviews", href: "/dashboard/reviews", icon: HiOutlineStar },
      {
         label: "Transactions",
         href: "/dashboard/transactions",
         icon: HiOutlineDocumentText,
      },
   ];

   const rawUrl = Array.isArray(typedUser?.avatar)
      ? typedUser?.avatar[0]?.url
      : typedUser?.avatar?.url;

   const userAvatar = rawUrl
      ? rawUrl.startsWith("http")
         ? rawUrl
         : `${process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"}${rawUrl}`
      : "/images/placeholder-avatar.jpg";

   return (
      <aside className="bg-white rounded-4 border p-4 shadow-sm w-100">
         {/* User Info Profile Section */}
         <div className="d-flex align-items-center gap-3 pb-4 mb-3 border-bottom">
            <div
               className="position-relative rounded-circle overflow-hidden flex-shrink-0 bg-dark text-white d-flex align-items-center justify-content-center fw-bold fs-5"
               style={{ width: "50px", height: "50px" }}
            >
               {userAvatar ? (
                  <Image
                     src={userAvatar}
                     alt={user?.username || "Guest User"}
                     fill
                     className="object-fit-cover"
                     unoptimized
                  />
               ) : (
                  (user?.username?.[0] || "U").toUpperCase()
               )}
            </div>
            <div className="overflow-hidden">
               <h6 className="fw-bold text-dark mb-0 text-truncate">
                  {user?.username || "Guest User"}
               </h6>
               <span className="text-muted small d-block text-truncate">
                  {user?.email || "guest@restify.com"}
               </span>
            </div>
         </div>

         {/* Navigation Menu */}
         <nav className="nav flex-column gap-1">
            {navItems.map((item) => {
               const IconComponent = item.icon;
               const isActive = pathname === item.href;

               return (
                  <Link
                     key={item.href}
                     href={item.href}
                     className={`nav-link d-flex align-items-center gap-3 px-3 py-2.5 rounded-pill transition-all ${
                        isActive
                           ? "bg-dark text-white fw-medium shadow-sm"
                           : "text-secondary hover-bg-light"
                     }`}
                     style={{
                        fontSize: "0.95rem",
                        transition: "all 0.2s ease-in-out",
                     }}
                  >
                     <IconComponent size={20} />
                     <span>{item.label}</span>
                  </Link>
               );
            })}
         </nav>

         {/* Logout Action */}
         <div className="pt-3 mt-3 border-top">
            <button
               onClick={logout}
               className="nav-link w-100 d-flex align-items-center gap-3 px-3 py-2.5 rounded-pill text-danger border-0 bg-transparent hover-bg-light text-start"
               style={{
                  fontSize: "0.95rem",
                  transition: "all 0.2s ease-in-out",
               }}
            >
               <HiOutlineArrowRightOnRectangle size={20} />
               <span>Log out</span>
            </button>
         </div>
      </aside>
   );
}
