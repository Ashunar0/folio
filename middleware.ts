import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/logout"];
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route)) || path === "/";

  // Auth routes that authenticated users shouldn't access
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  // If not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(redirectUrl);
  }

  // If authenticated and trying to access auth routes, redirect to home
  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  // Check team access for app routes
  // Skip if user just joined (joined=true query param)
  const justJoined = request.nextUrl.searchParams.get("joined") === "true";
  if (user && !justJoined && (path.startsWith("/app/") || path.match(/^\/[a-f0-9-]{36}\//))) {
    // Extract teamId from path
    const teamIdMatch = path.match(/^\/(?:app\/)?([a-f0-9-]{36})/);
    const teamId = teamIdMatch?.[1];

    if (teamId) {
      // Check if user is a member of this team
      const { data: membership } = await supabase
        .from("team_users")
        .select("team_id")
        .eq("team_id", teamId)
        .eq("user_id", user.id)
        .single();

      if (!membership) {
        // User is not a member - check their team count
        const { data: teams } = await supabase
          .from("team_users")
          .select("team_id")
          .eq("user_id", user.id);

        const redirectUrl = request.nextUrl.clone();
        
        if (!teams || teams.length === 0) {
          // No teams - go to onboarding
          redirectUrl.pathname = "/onboarding";
        } else if (teams.length === 1) {
          // One team - redirect to that team's dashboard
          redirectUrl.pathname = `/${teams[0].team_id}/dashboard`;
        } else {
          // Multiple teams - let them select
          redirectUrl.pathname = "/select-team";
        }
        
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
