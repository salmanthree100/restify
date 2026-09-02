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
import { defaultCountries, parseCountry } from "react-international-phone";
import * as Flags from "country-flag-icons/react/3x2";
import { formatE164 } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";

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

// Convert react-international-phone data into your dropdown format dynamically
const countryOptions = defaultCountries.map((country) => {
   const parsed = parseCountry(country);
   return {
      name: parsed.name,
      iso2: parsed.iso2.toUpperCase(),
      dialCode: `+${parsed.dialCode}`,
   };
});

export default function AuthModal({ show, onHide, onSuccess }: AuthModalProps) {
   // Consume AuthContext hook
   const { login } = useAuth();
   // consume useLocale hook
   const { t } = useLocale();

   const [activeTab, setActiveTab] = useState<"email" | "mobile">("email");
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

   // custom country list states
   const [isOpen, setIsOpen] = useState<boolean>(false);
   const [searchTerm, setSearchTerm] = useState<string>("");

   const fullPhoneNumber = `${selectedCountry}${phoneNumber.replace(/^0+/, "").replace(/\s+/g, "")}`;

   // Find the matching country based on your dialCode state ("+92")
   const currentCountry =
      countryOptions.find((c) => c.dialCode === selectedCountry) ||
      countryOptions.find((c) => c.iso2 === "PK") ||
      countryOptions[0];

   // Dynamic flag component
   const CurrentFlag = Flags[currentCountry.iso2 as keyof typeof Flags];

   const filteredCountries = countryOptions.filter(
      (c) =>
         c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         c.dialCode.includes(searchTerm) ||
         c.iso2.toLowerCase().includes(searchTerm.toLowerCase()),
   );

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
   // 3. Your handleSendOtp function
   const handleSendOtp = async (e: FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setErrorMsg("");

      // Pass your state variable `selectedCountry` here
      const e164PhoneNumber = formatE164(selectedCountry, phoneNumber);
      // Check your browser console: It MUST display "+923478359046"
      console.log("Sending to Firebase:", e164PhoneNumber);

      // Validate E.164 format (+ symbol followed by 7 to 15 digits)
      const isValidE164 = /^\+[1-9]\d{6,14}$/.test(e164PhoneNumber);

      if (!isValidE164) {
         setErrorMsg(`Invalid phone format: ${e164PhoneNumber}`);
         setLoading(false);
         return;
      }

      try {
         if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(
               auth,
               "recaptcha-container",
               { size: "invisible" },
            );
         }

         const confirmation = await signInWithPhoneNumber(
            auth,
            e164PhoneNumber,
            window.recaptchaVerifier,
         );

         setConfirmationResult(confirmation);
         setMobileStep("enter-otp");
      } catch (err: unknown) {
         console.error("Firebase Auth Error:", err);
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

         const res = await fetch("/api/strapi/auth-firebase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: firebaseIdToken }),
         });

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
         // 1. Attempt Sign-In
         // Call the Next.js rewrite endpoint directly using a relative path
         let res = await fetch("/api/strapi/auth/local", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier: email, password }),
         });
         let data = await res.json();

         // 2. If invalid credentials, attempt Auto-Registration for new users
         if (
            !res.ok &&
            data?.error?.message === "Invalid identifier or password"
         ) {
            const username = email.split("@")[0];

            res = await fetch(`/api/strapi/auth/local/register`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ username, email, password }),
            });

            data = await res.json();
         }

         if (!res.ok) {
            throw new Error(data?.error?.message || "Authentication failed.");
         }

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
      // Construct a full absolute URL using the browser's current origin
      const oauthUrl = new URL(
         `/api/strapi/connect/${provider}`,
         window.location.origin,
      );
      window.location.href = oauthUrl.toString();
   };

   return (
      <Modal show={show} onHide={onHide} centered className="auth-modal">
         <div id="recaptcha-container"></div>

         <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="w-100 text-center fs-6 fw-bold">
               {t.auth.modalTitle}
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
                           ? "primary-text border-bottom border-danger border-2"
                           : "text-muted"
                     }`}
                  >
                     {t.auth.emailTab.title}
                  </Nav.Link>
               </Nav.Item>
               <Nav.Item>
                  <Nav.Link
                     eventKey="mobile"
                     className={`p-0 pb-1 border-0 bg-transparent fw-medium ${
                        activeTab === "mobile"
                           ? "primary-text border-bottom border-danger border-2"
                           : "text-muted"
                     }`}
                  >
                     {t.auth.mobileTab.title}
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
                        {/* Country / Region Custom Dropdown */}
                        <div className="position-relative">
                           <label className="form-label fs-7 fw-medium text-dark mb-1">
                              {t.auth.mobileTab.countryLabel}
                              <span className="primary-text">*</span>
                           </label>

                           {/* Selected Box Display */}
                           <div
                              onClick={() => setIsOpen(!isOpen)}
                              className="form-control d-flex align-items-center justify-content-between py-2 px-3 rounded-3 cursor-pointer"
                              style={{ height: "48px", cursor: "pointer" }}
                           >
                              <div className="d-flex align-items-center gap-2">
                                 {CurrentFlag && (
                                    <CurrentFlag
                                       style={{
                                          width: "22px",
                                          height: "15px",
                                          borderRadius: "2px",
                                       }}
                                    />
                                 )}
                                 <span className="fw-medium text-dark">
                                    {currentCountry.name} (
                                    {currentCountry.dialCode})
                                 </span>
                              </div>
                              <small className="text-muted">▼</small>
                           </div>

                           {/* Expanded Options List */}
                           {isOpen && (
                              <div
                                 className="position-absolute start-0 w-100 bg-white border rounded-3 shadow-lg mt-1 p-2"
                                 style={{
                                    zIndex: 1000,
                                    maxHeight: "260px",
                                    overflowY: "auto",
                                 }}
                              >
                                 <input
                                    type="text"
                                    placeholder={
                                       t.auth.mobileTab.countrySearchPlaceholder
                                    }
                                    value={searchTerm}
                                    onChange={(e) =>
                                       setSearchTerm(e.target.value)
                                    }
                                    className="form-control form-control-sm mb-2"
                                    autoFocus
                                 />

                                 {filteredCountries.map((c) => {
                                    const ItemFlag =
                                       Flags[c.iso2 as keyof typeof Flags];
                                    return (
                                       <div
                                          key={c.iso2}
                                          onClick={() => {
                                             setSelectedCountry(c.dialCode); // Sets "+92" directly in state
                                             setIsOpen(false);
                                             setSearchTerm("");
                                          }}
                                          className={`d-flex align-items-center gap-2 px-2 py-2 rounded-2 ${
                                             c.iso2 === selectedCountry
                                                ? "bg-light fw-bold"
                                                : ""
                                          }`}
                                          style={{ cursor: "pointer" }}
                                       >
                                          {ItemFlag && (
                                             <ItemFlag
                                                style={{
                                                   width: "22px",
                                                   height: "15px",
                                                   borderRadius: "2px",
                                                }}
                                             />
                                          )}
                                          <span className="small text-dark">
                                             {c.name} ({c.dialCode})
                                          </span>
                                       </div>
                                    );
                                 })}
                              </div>
                           )}
                        </div>
                     </Form.Group>

                     <Form.Group className="mb-4">
                        <Form.Label className="fs-7 fw-medium text-dark">
                           {t.auth.mobileTab.mobileNumberLabel}
                           <span className="primary-text">*</span>
                        </Form.Label>
                        <Form.Control
                           type="tel"
                           placeholder={
                              t.auth.mobileTab.mobileNumberPlaceholder
                           }
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
                        className="w-100 py-2 fw-semibold rounded-3 subscribe-btn"
                     >
                        {loading
                           ? t.auth.mobileTab.sendingCodeText
                           : t.auth.continueBtnText}
                     </Button>
                  </Form>
               ) : (
                  <Form onSubmit={handleVerifyOtp}>
                     <div className="mb-3">
                        <span className="fs-7 text-muted">
                           {t.auth.codeSentText}{" "}
                           <strong>{fullPhoneNumber}</strong>
                        </span>{" "}
                        <button
                           type="button"
                           onClick={() => setMobileStep("enter-phone")}
                           className="btn btn-link p-0 fs-7 primary-text text-decoration-none ms-1"
                        >
                           {t.auth.editBtnText}
                        </button>
                     </div>

                     <Form.Group className="mb-4">
                        <Form.Label className="fs-7 fw-medium text-dark">
                           {t.auth.mobileTab.codeLabel}
                           <span className="primary-text">*</span>
                        </Form.Label>
                        <Form.Control
                           type="text"
                           maxLength={6}
                           placeholder={t.auth.mobileTab.codePlaceholder}
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
                        className="w-100 py-2 fw-semibold rounded-3 subscribe-btn"
                     >
                        {loading
                           ? t.auth.mobileTab.codeVerifyingText
                           : t.auth.mobileTab.codeLoginText}
                     </Button>
                  </Form>
               )
            ) : (
               <Form onSubmit={handleEmailAuth}>
                  <Form.Group className="mb-3">
                     <Form.Label className="fs-7 fw-medium text-dark">
                        {t.auth.emailTab.emailLabel}
                        <span className="primary-text">*</span>
                     </Form.Label>
                     <Form.Control
                        type="email"
                        placeholder={t.auth.emailTab.emailPlaceholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="py-2"
                     />
                  </Form.Group>

                  <Form.Group className="mb-4">
                     <Form.Label className="fs-7 fw-medium text-dark">
                        {t.auth.emailTab.passwordLabel}
                        <span className="primary-text">*</span>
                     </Form.Label>
                     <Form.Control
                        type="password"
                        placeholder={t.auth.emailTab.passwordPlaceholder}
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
                     className="w-100 py-2 fw-semibold rounded-3 subscribe-btn"
                  >
                     {loading ? "Authenticating..." : t.auth.continueBtnText}
                  </Button>
               </Form>
            )}

            <div className="position-relative my-4 text-center">
               <hr className="text-muted opacity-25" />
               <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 fs-7 text-muted">
                  {t.auth.socialLoginText}
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
