/**
 * NextAuth v5 middleware — protects dashboard routes, redirects unauthenticated
 * users to /sign-in, and prevents authenticated users from visiting auth pages.
 */
import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/sign-in", "/sign-up"];
const AUTH_ROUTES = ["/api/auth"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Always allow NextAuth API routes
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const isAuthenticated = !!req.auth;
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // Unauthenticated user trying to access a protected route → redirect to sign-in
  if (!isAuthenticated && !isPublicRoute) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Authenticated user trying to visit sign-in/sign-up → redirect to dashboard
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.svg$).*)",
  ],
};
