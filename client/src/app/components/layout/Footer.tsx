"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import {
   FaFacebookF,
   FaTwitter,
   FaLinkedinIn,
   FaInstagram,
} from "react-icons/fa";
import { useLocale } from "@/context/LocaleContext";
import { FooterData } from "@/app/types";
import qs from "qs";

const socialIconMap = {
   facebook: FaFacebookF,
   twitter: FaTwitter,
   linkedin: FaLinkedinIn,
   instagram: FaInstagram,
};

const Footer = () => {
   const { locale } = useLocale();
   const [footerData, setFooterData] = useState<FooterData | null>(null);
   const [loading, setLoading] = useState<boolean>(true);
   const [email, setEmail] = useState<string>("");

   useEffect(() => {
      async function fetchFooter() {
         setLoading(true);

         const query = qs.stringify(
            {
               locale,
               populate: {
                  footer: {
                     populate: {
                        columns: {
                           populate: {
                              links: "*",
                           },
                        },
                        newsletter: {
                           populate: "*",
                        },
                        socialLinks: {
                           populate: "*",
                        },
                     },
                  },
               },
            },
            { encodeValuesOnly: true },
         );

         try {
            const res = await fetch(`/api/strapi/global?${query}`);
            if (!res.ok) throw new Error("Failed to fetch footer data");

            const result = await res.json();
            const data = result?.data?.footer || null;
            setFooterData(data);
         } catch (error) {
            console.error("Error fetching footer:", error);
         } finally {
            setLoading(false);
         }
      }

      fetchFooter();
   }, [locale]);

   const handleSubscribe = (e: FormEvent) => {
      e.preventDefault();
      if (!email) return;
      // Handle newsletter API integration here
      console.log("Subscribing email:", email);
      setEmail("");
   };

   if (loading) {
      return (
         <footer className="bg-black text-white py-5 text-center">
            <Spinner animation="border" variant="light" size="sm" />
         </footer>
      );
   }

   if (!footerData) return null;

   const { columns, newsletter, socialLinks, copyrightText } = footerData;

   return (
      <footer className="bg-black text-white pt-5 pb-4">
         <Container>
            <Row className="gy-4 mb-5">
               {/* Dynamic Link Columns */}
               {columns?.map((col) => (
                  <Col key={col.id} lg={3} md={6} sm={12}>
                     <h5 className="fw-semibold mb-3 text-light">
                        {col.title}
                     </h5>
                     <ul className="list-unstyled mb-0">
                        {col.links?.map((link) => (
                           <li key={link.id} className="mb-2">
                              <Link
                                 href={link.url || "#"}
                                 className="text-secondary text-decoration-none hover-white transition-all"
                              >
                                 {link.label}
                              </Link>
                           </li>
                        ))}
                     </ul>
                  </Col>
               ))}

               {/* Newsletter Column */}
               {newsletter && (
                  <Col lg={3} md={6} sm={12}>
                     <h5 className="fw-semibold mb-3 text-light">
                        {newsletter.title || "Connect With Us"}
                     </h5>

                     {/* Social Icons */}
                     {socialLinks && socialLinks.length > 0 && (
                        <div className="d-flex gap-2 mb-3">
                           {socialLinks.map((item) => {
                              const IconComponent =
                                 socialIconMap[item.platform];
                              return (
                                 <a
                                    key={item.id}
                                    href={item.url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary footer-social-links rounded-3 d-flex align-items-center justify-content-center p-0"
                                    style={{ width: "32px", height: "32px" }}
                                 >
                                    {IconComponent && (
                                       <IconComponent size={14} />
                                    )}
                                 </a>
                              );
                           })}
                        </div>
                     )}

                     <p className="text-secondary small mb-3">
                        {newsletter.description}
                     </p>

                     {/* Subscription Form */}
                     <Form
                        onSubmit={handleSubscribe}
                        className="d-flex flex-column flex-sm-row gap-2"
                     >
                        <Form.Control
                           type="email"
                           placeholder={
                              newsletter.placeholderText || "Write your Email"
                           }
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="footer-input text-600 border-secondary rounded-3 fs-6"
                           required
                        />
                        <Button
                           type="submit"
                           variant="danger"
                           className="px-2 rounded-3 text-nowrap fw-medium subscribe-btn"
                        >
                           {newsletter.buttonText || "Subscribe"}
                        </Button>
                     </Form>
                  </Col>
               )}
            </Row>

            {/* Divider & Copyright */}
            <hr className="border-secondary opacity-25 my-4" />
            <Row>
               <Col className="text-center text-secondary small">
                  <p className="mb-0">
                     {copyrightText ||
                        `©${new Date().getFullYear()} Restify. All rights reserved`}
                  </p>
               </Col>
            </Row>
         </Container>
      </footer>
   );
};

export default Footer;
