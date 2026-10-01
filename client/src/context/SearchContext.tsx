"use client";

import React, { createContext, useContext, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DateRange } from "react-day-picker";

export interface GuestCounts {
   [key: string]: number;
   adults: number;
   children: number;
   infants: number;
   pets: number;
}

interface SearchContextType {
   dates: DateRange | undefined;
   setDates: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
   guestCounts: GuestCounts;
   setGuestCounts: React.Dispatch<React.SetStateAction<GuestCounts>>;
   destinationInput: string;
   setDestinationInput: React.Dispatch<React.SetStateAction<string>>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
   const searchParams = useSearchParams();

   const [dates, setDates] = useState<DateRange | undefined>(() => {
      const checkIn = searchParams.get("checkIn");
      const checkOut = searchParams.get("checkOut");
      if (checkIn) {
         return {
            from: new Date(checkIn),
            to: checkOut ? new Date(checkOut) : undefined,
         };
      }
      return undefined;
   });

   const [guestCounts, setGuestCounts] = useState<GuestCounts>(() => ({
      adults: parseInt(searchParams.get("adults") || "1", 10),
      children: parseInt(searchParams.get("children") || "0", 10),
      infants: parseInt(searchParams.get("infants") || "0", 10),
      pets: parseInt(searchParams.get("pets") || "0", 10),
   }));

   const [destinationInput, setDestinationInput] = useState<string>(
      () => searchParams.get("destination") || "",
   );

   return (
      <SearchContext.Provider
         value={{
            dates,
            setDates,
            guestCounts,
            setGuestCounts,
            destinationInput,
            setDestinationInput,
         }}
      >
         {children}
      </SearchContext.Provider>
   );
};

export const useSearch = () => {
   const context = useContext(SearchContext);
   if (!context) {
      throw new Error("useSearch must be used within a SearchProvider");
   }
   return context;
};
