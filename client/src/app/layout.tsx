import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { LocaleProvider } from "@/context/LocaleContext";
import Header from "@/app/components/layout/Header";

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
         <body>
            <CurrencyProvider>
               <LocaleProvider>
                  <Header />
                  {children}
               </LocaleProvider>
            </CurrencyProvider>
         </body>
      </html>
   );
}
