"use client";

import React, { createContext, useContext, useState } from "react";

// Import dictionary JSON files
import en from "@/dictionaries/en.json";
import es from "@/dictionaries/es.json";
import fr from "@/dictionaries/fr.json";
import de from "@/dictionaries/de.json";
import it from "@/dictionaries/it.json";
import ja from "@/dictionaries/ja.json";
import ko from "@/dictionaries/ko.json";

export type SupportedLocale = "en" | "es" | "fr" | "de" | "it" | "ja" | "ko";

// Infer dictionary type from en.json
type Dictionary = typeof en;

const dictionaries: Record<SupportedLocale, Dictionary> = {
   en,
   es,
   fr,
   de,
   it,
   ja,
   ko,
};

// 1. Define the Context interface
interface LocaleContextType {
   locale: SupportedLocale;
   setLocale: (newLocale: SupportedLocale) => void;
   t: Dictionary;
}

// 2. Create the Context with undefined initial value for safety checks
const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
   children: React.ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
   // 3. Lazy state initialization with fallback to 'en'
   const [locale, setLocaleState] = useState<SupportedLocale>(() => {
      if (typeof window !== "undefined") {
         const saved = localStorage.getItem(
            "selectedLocale",
         ) as SupportedLocale;
         if (saved && dictionaries[saved]) {
            return saved;
         }
      }
      return "en";
   });

   // 4. Custom setter wrapper that syncs state and localStorage
   const changeLocale = (newLocale: SupportedLocale) => {
      if (dictionaries[newLocale]) {
         setLocaleState(newLocale);
         localStorage.setItem("selectedLocale", newLocale);
      }
   };

   // Get current active dictionary (defaults to en if undefined)
   const t = dictionaries[locale] || en;

   return (
      <LocaleContext.Provider value={{ locale, setLocale: changeLocale, t }}>
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
