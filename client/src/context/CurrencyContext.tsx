// src/context/CurrencyContext.tsx
"use client";

import React, { createContext, useContext, useState } from "react";

interface CurrencyContextType {
   currency: string;
   setCurrency: (code: string) => void;
   language: string;
   setLanguage: (code: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
   undefined,
);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
   // Initialize state lazily from localStorage
   const [currency, setCurrencyState] = useState<string>(() => {
      if (typeof window !== "undefined") {
         return localStorage.getItem("app_currency") || "USD";
      }
      return "USD";
   });

   const [language, setLanguageState] = useState<string>(() => {
      if (typeof window !== "undefined") {
         return localStorage.getItem("app_lang") || "en-US";
      }
      return "en-US";
   });

   // Sync state changes back to localStorage
   const setCurrency = (code: string) => {
      setCurrencyState(code);
      localStorage.setItem("app_currency", code);
   };

   const setLanguage = (code: string) => {
      setLanguageState(code);
      localStorage.setItem("app_lang", code);
   };

   return (
      <CurrencyContext.Provider
         value={{ currency, setCurrency, language, setLanguage }}
      >
         {children}
      </CurrencyContext.Provider>
   );
}

export const useCurrency = () => {
   const context = useContext(CurrencyContext);
   if (!context)
      throw new Error("useCurrency must be used within CurrencyProvider");
   return context;
};
