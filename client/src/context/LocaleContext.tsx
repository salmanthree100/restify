"use client";

import React, { createContext, useContext, useState } from "react";

// 1. Define the Context interface
interface LocaleContextType {
   locale: string;
   setLocale: (newLocale: string) => void;
}

// 2. Create the Context with undefined initial value for safety checks
const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
   children: React.ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
   // 3. Lazy state initialization: Reads localStorage directly on mount
   // to avoid cascading render warnings from useEffect
   const [locale, setLocaleState] = useState<string>(() => {
      if (typeof window !== "undefined") {
         return localStorage.getItem("selectedLocale") || "en";
      }
      return "en";
   });

   // 4. Custom setter wrapper that syncs state and localStorage
   const changeLocale = (newLocale: string) => {
      setLocaleState(newLocale);
      localStorage.setItem("selectedLocale", newLocale);
   };

   return (
      <LocaleContext.Provider value={{ locale, setLocale: changeLocale }}>
         {children}
      </LocaleContext.Provider>
   );
}

// 5. Custom hook with strict type checks
export function useLocale(): LocaleContextType {
   const context = useContext(LocaleContext);
   if (!context) {
      throw new Error("useLocale must be used within a LocaleProvider");
   }
   return context;
}
