import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
   const token = request.cookies.get("token")?.value;
   const { pathname } = request.nextUrl;

   // Protect private routes (e.g., /dashboard, /profile)
   if (!token && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/", request.url));
   }

   return NextResponse.next();
}

export const config = {
   matcher: ["/dashboard/:path*", "/profile/:path*"],
};
