// src/context/CurrencyContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CurrencyContextType {
   currency: string;
   setCurrency: (code: string) => void;
   exchangeRate: number;
   formatPrice: (amountInUSD: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
   undefined,
);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
   const [currency, setCurrencyState] = useState<string>(() => {
      if (typeof window !== "undefined") {
         return localStorage.getItem("app_currency") || "USD";
      }
      return "USD";
   });

   const setCurrency = (code: string) => {
      setCurrencyState(code);
      localStorage.setItem("app_currency", code);
   };

   const [fetchedRate, setFetchedRate] = useState<number>(1);
   const exchangeRate = currency === "USD" ? 1 : fetchedRate;

   useEffect(() => {
      if (currency === "USD") return;
      let isMounted = true;

      const fetchRate = async () => {
         try {
            const res = await fetch(`/api/currencies?from=USD&to=${currency}`);
            const data = await res.json();
            if (isMounted && data?.rate) {
               setFetchedRate(data.rate);
            }
         } catch (err) {
            console.error("Error fetching pair exchange rate:", err);
         }
      };

      fetchRate();
      return () => {
         isMounted = false;
      };
   }, [currency]);

   const formatPrice = (amountInUSD: number): string => {
      const convertedAmount = amountInUSD * exchangeRate;
      return new Intl.NumberFormat("en-US", {
         style: "currency",
         currency: currency,
         maximumFractionDigits: 0,
      }).format(convertedAmount);
   };

   return (
      <CurrencyContext.Provider
         value={{ currency, setCurrency, exchangeRate, formatPrice }}
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
