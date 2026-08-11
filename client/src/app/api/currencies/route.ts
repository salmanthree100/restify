// app/api/currencies/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
   const { searchParams } = new URL(request.url);

   // Extract currencies from query params (e.g. /api/currencies?from=USD&to=EUR)
   const from = searchParams.get("from") || "USD";
   const to = searchParams.get("to") || "USD";

   const apiKey = process.env.EXCHANGE_RATE_KEY;

   if (!apiKey) {
      return NextResponse.json(
         { error: "Exchange rate API key is missing" },
         { status: 500 },
      );
   }

   try {
      const res = await fetch(
         `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}`,
         {
            next: { revalidate: 3600 }, // Cache exchange rate for 1 hour to save API calls
         },
      );

      if (!res.ok) {
         throw new Error(`API returned status ${res.status}`);
      }

      const data = await res.json();

      return NextResponse.json({
         base: data.base_code,
         target: data.target_code,
         rate: data.conversion_rate, // e.g., 0.92
      });
   } catch (error) {
      console.error("Failed to fetch exchange rate:", error);
      return NextResponse.json(
         { error: "Failed to fetch exchange rate" },
         { status: 500 },
      );
   }
}
