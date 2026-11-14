import { NextResponse, type NextRequest } from "next/server";

const AREAS: Record<string, string> = { "/buyer": "buyer", "/seller": "seller", "/admin": "staff" };

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const area = Object.keys(AREAS).find((a) => pathname === a || pathname.startsWith(a + "/"));
  if (!area) return NextResponse.next();
  const role = req.cookies.get("dgix_role")?.value;
  if (!role) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (role !== AREAS[area]) {
    const home = Object.entries(AREAS).find(([, r]) => r === role)?.[0] ?? "/";
    const url = req.nextUrl.clone();
    url.pathname = home;
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/buyer/:path*", "/seller/:path*", "/admin/:path*"] };
