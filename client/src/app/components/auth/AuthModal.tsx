"use client";

import { useState, FormEvent } from "react";
import { Modal, Form, Button, Nav } from "react-bootstrap";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaApple } from "react-icons/fa";
import {
   RecaptchaVerifier,
   signInWithPhoneNumber,
   ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth, User } from "@/context/AuthContext";

interface AuthModalProps {
   show: boolean;
   onHide: () => void;
   onSuccess?: (token: string, user: User) => void;
}

interface StrapiAuthResponse {
   jwt: string;
   user: User;
   error?: {
      message?: string;
   };
}

const countryCodes = [
   { code: "+92", country: "Pakistan", flag: "🇵🇰" },
   { code: "+48", country: "Sweden", flag: "🇸🇪" },
   { code: "+1", country: "United States", flag: "🇺🇸" },
   { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
   { code: "+49", country: "Germany", flag: "🇩🇪" },
];

export default function AuthModal({ show, onHide, onSuccess }: AuthModalProps) {
   // Consume AuthContext hook
   const { login } = useAuth();

   const [activeTab, setActiveTab] = useState<"email" | "mobile">("mobile");
   const [loading, setLoading] = useState<boolean>(false);
   const [errorMsg, setErrorMsg] = useState<string>("");

   // Mobile Auth States
   const [mobileStep, setMobileStep] = useState<"enter-phone" | "enter-otp">(
      "enter-phone",
   );
   const [selectedCountry, setSelectedCountry] = useState<string>("+92");
   const [phoneNumber, setPhoneNumber] = useState<string>("");
   const [otpCode, setOtpCode] = useState<string>("");
   const [confirmationResult, setConfirmationResult] =
      useState<ConfirmationResult | null>(null);

   // Email Auth States
   const [email, setEmail] = useState<string>("");
   const [password, setPassword] = useState<string>("");

   const fullPhoneNumber = `${selectedCountry}${phoneNumber.replace(/^0+/, "").replace(/\s+/g, "")}`;

   // Helper handler for successful authentication
   const handleAuthSuccess = (jwt: string, user: User) => {
      login(jwt, user); // Updates global React state, localStorage, and Cookies simultaneously
      if (onSuccess) onSuccess(jwt, user);
      onHide();
   };

   const handleTabSelect = (tab: "email" | "mobile") => {
      setActiveTab(tab);
      setErrorMsg("");
      setMobileStep("enter-phone");
      setOtpCode("");
   };

   // 1. Mobile Step 1: Send SMS OTP
   const handleSendOtp = async (e: FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setErrorMsg("");

      try {
         if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(
               auth,
               "recaptcha-container",
               {
                  size: "invisible",
               },
            );
         }

         const confirmation = await signInWithPhoneNumber(
            auth,
            fullPhoneNumber,
            window.recaptchaVerifier,
         );

         setConfirmationResult(confirmation);
         setMobileStep("enter-otp");
      } catch (err: unknown) {
         console.error(err);
         const message =
            err instanceof Error ? err.message : "Failed to send SMS code.";
         setErrorMsg(message);
         if (window.recaptchaVerifier) {
            try {
               window.recaptchaVerifier.clear();
               window.recaptchaVerifier = null;
            } catch {
               // Cleared safely
            }
         }
      } finally {
         setLoading(false);
      }
   };

   // 2. Mobile Step 2: Verify OTP
   const handleVerifyOtp = async (e: FormEvent) => {
      e.preventDefault();
      if (!confirmationResult) return;

      setLoading(true);
      setErrorMsg("");

      try {
         const userCredential = await confirmationResult.confirm(otpCode);
         const firebaseIdToken = await userCredential.user.getIdToken();

         const res = await fetch(
            `${process.env.NEXT_PUBLIC_STRAPI_LOCAL_URL}/api/auth-firebase`,
            {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ idToken: firebaseIdToken }),
            },
         );

         const data: StrapiAuthResponse = await res.json();
         if (!res.ok)
            throw new Error(
               data?.error?.message || "Strapi authentication failed.",
            );

         handleAuthSuccess(data.jwt, data.user);
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Invalid or expired OTP code.";
         setErrorMsg(message);
      } finally {
         setLoading(false);
      }
   };

   // 3. Email/Password Authentication
   const handleEmailAuth = async (e: FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setErrorMsg("");

      try {
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/auth/local`,
            {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ identifier: email, password }),
            },
         );

         const data: StrapiAuthResponse = await res.json();
         if (!res.ok)
            throw new Error(
               data?.error?.message || "Invalid email or password.",
            );

         handleAuthSuccess(data.jwt, data.user);
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Authentication failed.";
         setErrorMsg(message);
      } finally {
         setLoading(false);
      }
   };

   // 4. Social OAuth Provider Redirect
   const handleOAuthLogin = (provider: "google" | "facebook" | "apple") => {
      const baseUrl =
         process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
      const oauthUrl = new URL(`/api/connect/${provider}`, baseUrl);
      window.location.assign(oauthUrl);
   };

   return (
      <Modal show={show} onHide={onHide} centered className="auth-modal">
         <div id="recaptcha-container"></div>

         <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="w-100 text-center fs-6 fw-bold">
               Login or Sign up
            </Modal.Title>
         </Modal.Header>

         <Modal.Body className="px-4 pb-4">
            <Nav
               variant="tabs"
               activeKey={activeTab}
               onSelect={(k) => handleTabSelect(k as "email" | "mobile")}
               className="border-0 mb-4 justify-content-start gap-3"
            >
               <Nav.Item>
                  <Nav.Link
                     eventKey="email"
                     className={`p-0 pb-1 border-0 bg-transparent fw-medium ${
                        activeTab === "email"
                           ? "text-danger border-bottom border-danger border-2"
                           : "text-muted"
                     }`}
                  >
                     Email
                  </Nav.Link>
               </Nav.Item>
               <Nav.Item>
                  <Nav.Link
                     eventKey="mobile"
                     className={`p-0 pb-1 border-0 bg-transparent fw-medium ${
                        activeTab === "mobile"
                           ? "text-danger border-bottom border-danger border-2"
                           : "text-muted"
                     }`}
                  >
                     Mobile
                  </Nav.Link>
               </Nav.Item>
            </Nav>

            {errorMsg && (
               <div className="alert alert-danger py-2 fs-7">{errorMsg}</div>
            )}

            {activeTab === "mobile" ? (
               mobileStep === "enter-phone" ? (
                  <Form onSubmit={handleSendOtp}>
                     <Form.Group className="mb-3">
                        <Form.Label className="fs-7 fw-medium text-dark">
                           Country/Region<span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                           value={selectedCountry}
                           onChange={(e) => setSelectedCountry(e.target.value)}
                           className="py-2"
                        >
                           {countryCodes.map((item) => (
                              <option key={item.code} value={item.code}>
                                 {item.flag} {item.country} ({item.code})
                              </option>
                           ))}
                        </Form.Select>
                     </Form.Group>

                     <Form.Group className="mb-4">
                        <Form.Label className="fs-7 fw-medium text-dark">
                           Phone number<span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                           type="tel"
                           placeholder="347 8359046"
                           value={phoneNumber}
                           onChange={(e) => setPhoneNumber(e.target.value)}
                           required
                           className="py-2"
                        />
                     </Form.Group>

                     <Button
                        variant="danger"
                        type="submit"
                        disabled={loading || !phoneNumber}
                        className="w-100 py-2 fw-semibold rounded-3"
                     >
                        {loading ? "Sending Code..." : "Continue"}
                     </Button>
                  </Form>
               ) : (
                  <Form onSubmit={handleVerifyOtp}>
                     <div className="mb-3">
                        <span className="fs-7 text-muted">
                           Code sent to <strong>{fullPhoneNumber}</strong>
                        </span>{" "}
                        <button
                           type="button"
                           onClick={() => setMobileStep("enter-phone")}
                           className="btn btn-link p-0 fs-7 text-danger text-decoration-none ms-1"
                        >
                           Edit
                        </button>
                     </div>

                     <Form.Group className="mb-4">
                        <Form.Label className="fs-7 fw-medium text-dark">
                           Enter 6-digit Code
                           <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                           type="text"
                           maxLength={6}
                           placeholder="123456"
                           value={otpCode}
                           onChange={(e) => setOtpCode(e.target.value)}
                           required
                           className="py-2 text-center fs-5 letter-spacing-2"
                        />
                     </Form.Group>

                     <Button
                        variant="danger"
                        type="submit"
                        disabled={loading || otpCode.length < 4}
                        className="w-100 py-2 fw-semibold rounded-3"
                     >
                        {loading ? "Verifying..." : "Verify & Sign In"}
                     </Button>
                  </Form>
               )
            ) : (
               <Form onSubmit={handleEmailAuth}>
                  <Form.Group className="mb-3">
                     <Form.Label className="fs-7 fw-medium text-dark">
                        Email address<span className="text-danger">*</span>
                     </Form.Label>
                     <Form.Control
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="py-2"
                     />
                  </Form.Group>

                  <Form.Group className="mb-4">
                     <Form.Label className="fs-7 fw-medium text-dark">
                        Password<span className="text-danger">*</span>
                     </Form.Label>
                     <Form.Control
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="py-2"
                     />
                  </Form.Group>

                  <Button
                     variant="danger"
                     type="submit"
                     disabled={loading}
                     className="w-100 py-2 fw-semibold rounded-3"
                  >
                     {loading ? "Authenticating..." : "Continue"}
                  </Button>
               </Form>
            )}

            <div className="position-relative my-4 text-center">
               <hr className="text-muted opacity-25" />
               <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 fs-7 text-muted">
                  or continue with
               </span>
            </div>

            <div className="d-flex gap-2">
               <Button
                  variant="outline-secondary"
                  onClick={() => handleOAuthLogin("google")}
                  className="w-100 d-flex align-items-center justify-content-center gap-2 py-2 fs-7"
               >
                  <FcGoogle size={18} /> Google
               </Button>
               <Button
                  variant="outline-secondary"
                  onClick={() => handleOAuthLogin("facebook")}
                  className="w-100 d-flex align-items-center justify-content-center gap-2 py-2 fs-7 text-primary"
               >
                  <FaFacebook size={18} /> Facebook
               </Button>
               <Button
                  variant="outline-secondary"
                  onClick={() => handleOAuthLogin("apple")}
                  className="w-100 d-flex align-items-center justify-content-center gap-2 py-2 fs-7 text-dark"
               >
                  <FaApple size={18} /> Apple
               </Button>
            </div>
         </Modal.Body>
      </Modal>
   );
}

declare global {
   interface Window {
      recaptchaVerifier: RecaptchaVerifier | null;
   }
}
