"use client";

import React from "react";
import Image from "next/image";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import {
   FaStar,
   FaShieldAlt,
   FaMedal,
   FaGraduationCap,
   FaBriefcase,
   FaMusic,
   FaPaw,
   FaSmile,
   FaPeopleArrows,
} from "react-icons/fa";
import { IoSchoolOutline } from "react-icons/io5";
import { MdOutlineWorkOutline, MdOutlinePets } from "react-icons/md";
import { BiDrink } from "react-icons/bi";

// Strapi Media Format Interface
interface MediaFormat {
   url: string;
}

interface StrapiImage {
   id?: number;
   url?: string;
   alternativeText?: string | null;
   formats?: {
      thumbnail?: MediaFormat;
      small?: MediaFormat;
   } | null;
}

export interface OtherHost {
   id: number;
   name: string;
   icon?: StrapiImage;
}

export interface HostInfoItem {
   id: number;
   description: string;
   iconName: string;
}

export interface HostData {
   id?: number;
   documentId?: string;
   name?: string;
   isSuperhost?: boolean;
   bio?: string;
   reviewsCount?: string | number;
   reviewsText?: string;
   ratingValue?: string | number;
   ratingText?: string;
   yearsCount?: string | number;
   yearsText?: string;
   title?: string;
   description?: string;
   messageBtn?: string;
   hostInfo?: HostInfoItem[];
   otherHosts?: OtherHost[];
   avatar?: StrapiImage;
}

interface HostSectionProps {
   host?: HostData;
}

// Icon Mapping Function based on iconName string from Strapi
const renderIcon = (iconName?: string) => {
   switch (iconName) {
      case "IoSchoolOutline":
         return <IoSchoolOutline color="#E23212" className="fs-5" />;
      case "MdOutlineWorkOutline":
         return <MdOutlineWorkOutline color="#E23212" className="fs-5" />;
      case "BiDrink":
         return <BiDrink color="#E23212" className="fs-5" />;
      case "MdOutlinePets":
         return <MdOutlinePets color="#E23212" className="fs-5" />;
      case "FaPeopleArrows":
         return <FaPeopleArrows color="#E23212" className="fs-5" />;
      case "FaGraduationCap":
         return <FaGraduationCap color="#E23212" className="fs-5" />;
      case "FaBriefcase":
         return <FaBriefcase color="#E23212" className="fs-5" />;
      case "FaMusic":
         return <FaMusic color="#E23212" className="fs-5" />;
      case "FaPaw":
         return <FaPaw color="#E23212" className="fs-5" />;
      case "FaSmile":
         return <FaSmile color="#E23212" className="fs-5" />;
      default:
         return <FaSmile color="#E23212" className="fs-5" />;
   }
};

const HostSection: React.FC<HostSectionProps> = ({ host }) => {
   const baseUrl =
      process.env.NEXT_PUBLIC_STRAPI_CLOUD_URL ||
      process.env.NEXT_PUBLIC_STRAPI_LOCAL_URL ||
      "http://localhost:1337";

   // Host Data Fallbacks
   const hostName = host?.name || "Quentin";
   const rating = host?.ratingValue ?? "4.96";
   const ratingText = host?.ratingText || "Rating";
   const reviewsCount = host?.reviewsCount ?? "396";
   const reviewsText = host?.reviewsText || "Reviews";
   const yearsCount = host?.yearsCount ?? "3";
   const yearsText = host?.yearsText || "Years hosting";
   const title = host?.title || `${hostName} is a Super host`;
   const description =
      host?.description ||
      "Super hosts are experienced, highly rated hosts who are committed to providing great stay for guests.";
   const messageBtnText = host?.messageBtn || "Message host";
   const bio =
      host?.bio ||
      "I am recently an empty nester and just moved to Edmonton This past summer. I love Hosting so I thought I would give name of our site a try! It’s been a great experience to meet so many folks from all over the world!";

   // Main Host Avatar Resolver
   const rawAvatarUrl =
      host?.avatar?.formats?.small?.url ||
      host?.avatar?.formats?.thumbnail?.url ||
      host?.avatar?.url;

   const avatarSrc = rawAvatarUrl
      ? rawAvatarUrl.startsWith("http")
         ? rawAvatarUrl
         : `${baseUrl}${rawAvatarUrl}`
      : "/images/default-avatar.jpg";

   // Helper for Co-Hosts' Avatars
   const getOtherHostAvatar = (iconObj?: StrapiImage) => {
      const url =
         iconObj?.formats?.thumbnail?.url ||
         iconObj?.formats?.small?.url ||
         iconObj?.url;

      if (!url) return "/images/default-avatar.jpg";
      return url.startsWith("http") ? url : `${baseUrl}${url}`;
   };

   // Default fallback if hostInfo is not provided
   const defaultHostInfo: HostInfoItem[] = [
      {
         id: 16,
         description: "Where I went to school: Buderheim",
         iconName: "IoSchoolOutline",
      },
      {
         id: 17,
         description: "My work: social work",
         iconName: "MdOutlineWorkOutline",
      },
      {
         id: 18,
         description: "Fun fact: I love singing but can’t keep a tune",
         iconName: "BiDrink",
      },
      {
         id: 19,
         description: "Pets: King Charles the cat",
         iconName: "MdOutlinePets",
      },
      {
         id: 20,
         description:
            "I’m happy to spend time with my guests or give them space",
         iconName: "FaPeopleArrows",
      },
   ];

   const hostInfoList =
      host?.hostInfo && host.hostInfo.length > 0
         ? host.hostInfo
         : defaultHostInfo;

   return (
      <section className="host-section py-5">
         <Container>
            <div className="mb-4">
               <h3 className="fw-bold">Meet your host</h3>
            </div>
            <Row className="g-5">
               {/* LEFT COLUMN: Main Host Profile Card & Details */}
               <Col lg={5} md={6}>
                  <Card className="border-0 shadow-sm rounded-4 p-4 text-center bg-light mb-4">
                     <Card.Body className="p-0">
                        <Row className="align-items-center">
                           <Col
                              xs={5}
                              className="d-flex flex-column align-items-center"
                           >
                              <div className="position-relative mb-2">
                                 <div
                                    className="rounded-circle overflow-hidden shadow-sm position-relative"
                                    style={{ width: "90px", height: "90px" }}
                                 >
                                    <Image
                                       src={avatarSrc}
                                       alt={hostName}
                                       fill
                                       className="object-fit-cover"
                                    />
                                 </div>
                                 {host?.isSuperhost && (
                                    <span
                                       className="position-absolute bottom-0 end-0 bg-danger text-white rounded-circle d-flex align-items-center justify-content-center shadow"
                                       style={{
                                          width: "26px",
                                          height: "26px",
                                          transform: "translate(10%, 10%)",
                                       }}
                                       title="Superhost"
                                    >
                                       <FaShieldAlt size={13} />
                                    </span>
                                 )}
                              </div>
                              <h4 className="fw-bold mb-0">{hostName}</h4>
                              {host?.isSuperhost && (
                                 <small className="text-muted d-flex align-items-center gap-1">
                                    <FaMedal color="#E23212" /> Superhost
                                 </small>
                              )}
                           </Col>

                           {/* Rating & Stats Column */}
                           <Col
                              xs={7}
                              className="text-center border-start ps-3"
                           >
                              <div className="mb-2">
                                 <div className="fs-5 mb-0">{reviewsCount}</div>
                                 <div className="text-muted extra-small">
                                    {reviewsText}
                                 </div>
                              </div>
                              <hr className="my-2" />
                              <div className="mb-2">
                                 <div className="fs-5 mb-0">{rating} </div>
                                 <div className="text-muted extra-small">
                                    {ratingText}
                                 </div>
                              </div>
                              <hr className="my-2" />
                              <div>
                                 <div className="fs-5 mb-0">{yearsCount}</div>
                                 <div className="text-muted extra-small">
                                    {yearsText}
                                 </div>
                              </div>
                           </Col>
                        </Row>
                     </Card.Body>
                  </Card>

                  {/* Dynamic Host Info List */}
                  <div className="d-flex flex-column gap-3 mb-4">
                     {hostInfoList.map((item) => (
                        <div
                           key={item.id}
                           className="d-flex align-items-center gap-3"
                        >
                           <div className="d-flex align-items-center justify-content-center">
                              {renderIcon(item.iconName)}
                           </div>
                           <div className="text-secondary small">
                              {item.description}
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Bio Description */}
                  <p
                     className="text-secondary small"
                     style={{ lineHeight: "1.6" }}
                  >
                     {bio}
                  </p>
               </Col>

               {/* RIGHT COLUMN: Superhost banner, Co-hosts list, Response info */}
               <Col
                  lg={7}
                  md={6}
                  className="ps-lg-5 d-flex flex-column justify-content-between"
               >
                  <div>
                     {/* Title & Description */}
                     <div className="mb-4">
                        <h5 className="fw-bold mb-1">{title}</h5>
                        <p className="text-muted small">{description}</p>
                     </div>

                     {/* Co-hosts section mapped directly using the 'icon' object */}
                     {host?.otherHosts && host.otherHosts.length > 0 && (
                        <div className="mb-4">
                           <h6 className="fw-bold mb-3">Co-hosts</h6>
                           <div className="d-flex flex-wrap gap-4 align-items-center">
                              {host.otherHosts.map((coHost) => (
                                 <div
                                    key={coHost.id}
                                    className="d-flex align-items-center gap-2"
                                 >
                                    <div
                                       className="rounded-circle overflow-hidden position-relative shadow-sm flex-shrink-0"
                                       style={{ width: "40px", height: "40px" }}
                                    >
                                       <Image
                                          src={getOtherHostAvatar(coHost.icon)}
                                          alt={coHost.name}
                                          fill
                                          className="object-fit-cover"
                                       />
                                    </div>
                                    <span className="small fw-medium text-dark">
                                       {coHost.name}
                                    </span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Host Details */}
                     <div className="mb-4">
                        <h6 className="fw-bold mb-2">Host details</h6>
                        <p className="text-muted small mb-1">
                           Response rate: <strong>100%</strong>
                        </p>
                        <p className="text-muted small">
                           Responds <strong>within an hour</strong>
                        </p>
                     </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-3">
                     <Button
                        variant="outline-dark"
                        size="sm"
                        className="rounded-3 px-4 py-2"
                     >
                        {messageBtnText}
                     </Button>
                  </div>
               </Col>
            </Row>
         </Container>
      </section>
   );
};

export default HostSection;
