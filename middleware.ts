import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};

// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/api"];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isPublic = PUBLIC_PATHS.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  // Redirect unauthenticated users trying to access private pages
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

// Protect all routes
// export const config = {
//   matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
// };
