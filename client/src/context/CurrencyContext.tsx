// src/context/CurrencyContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CurrencyContextType {
   currency: string;
   setCurrency: (code: string) => void;
   language: string;
   setLanguage: (code: string) => void;
   exchangeRate: number; // Conversion rate multiplier
   formatPrice: (amountInUSD: number) => string; // Helper to calculate and format prices
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

   const [fetchedRate, setFetchedRate] = useState<number>(1);

   // Derive the active rate directly during render (No extra useEffect setState!)
   const exchangeRate = currency === "USD" ? 1 : fetchedRate;

   useEffect(() => {
      // Skip API request if USD is selected
      if (currency === "USD") return;

      let isMounted = true;

      const fetchRate = async () => {
         try {
            const res = await fetch(`/api/currencies?from=USD&to=${currency}`);
            const data = await res.json();

            // Asynchronous callback state update is completely safe in effects
            if (isMounted && data?.rate) {
               setFetchedRate(data.rate);
            }
         } catch (err) {
            console.error("Error fetching pair exchange rate:", err);
         }
      };

      fetchRate();

      return () => {
         isMounted = false; // Cleanup to avoid setting state on unmounted components
      };
   }, [currency]);

   // Utility to convert base USD price to active currency
   const formatPrice = (amountInUSD: number): string => {
      const convertedAmount = amountInUSD * exchangeRate;
      return new Intl.NumberFormat("en-US", {
         style: "currency",
         currency: currency,
         maximumFractionDigits: 0, // Set to 2 if you prefer showing cents
      }).format(convertedAmount);
   };

   return (
      <CurrencyContext.Provider
         value={{
            currency,
            setCurrency,
            language,
            setLanguage,
            exchangeRate,
            formatPrice,
         }}
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
