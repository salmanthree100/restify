import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { LocaleProvider } from "@/context/LocaleContext";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { SearchProvider } from "@/context/SearchContext";

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
                  <AuthProvider>
                     <SearchProvider>
                        <Header />
                        {children}
                        <Footer />
                     </SearchProvider>
                  </AuthProvider>
               </LocaleProvider>
            </CurrencyProvider>
         </body>
      </html>
   );
}
