import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const path = new URL(request.url).pathname;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const protectedRoutes = [
    /^\/new_post(\/.*)?$/,
    /^\/account_settings(\/.*)?$/,
    /^\/my_posts(\/.*)?$/,
    /^\/posts\/[^/]+\/update(\/.*)?$/,
  ];

  const isProtected = protectedRoutes.some((route) => route.test(path));

  if (isProtected && !token) {
    return NextResponse.rewrite(new URL("/unauthorized", request.url));
  }

  if (token && path === "/unauthorized") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/auth).*)",
  ],
};
