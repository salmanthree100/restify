import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { LocaleProvider } from "@/context/LocaleContext";

const inter = Inter({
   variable: "--font-inter",
   subsets: ["latin"],
});

export const metadata: Metadata = {
   title: "Restify - Hotel Booking App",
   description: "A Hotel Booking platfrom built with Next.js",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
   return (
      <html lang="en" className={`${inter.variable}`}>
         <CurrencyProvider>
            <LocaleProvider>
               <body>{children}</body>
            </LocaleProvider>
         </CurrencyProvider>
      </html>
   );
}
