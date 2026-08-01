import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/config/env";

const PUBLIC_PATHS = ["/login", "/esqueci-minha-senha", "/redefinir-senha", "/auth/callback"];

// O Aplicativo do Consumidor (APP-001) tem identidade própria (IDENT-001), separada da
// autenticação multiempresa da Retaguarda — não deve ser bloqueado por esta checagem de sessão.
function isConsumerPath(pathname: string): boolean {
  return pathname === "/cliente" || pathname.startsWith("/cliente/");
}

function isPublicPath(pathname: string): boolean {
  if (isConsumerPath(pathname)) return true;
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // auth.getUser() revalida o token contra o servidor — necessário para
  // manter a sessão atualizada a cada requisição (ver @supabase/ssr).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const publicPath = isPublicPath(pathname);

  if (!user && !publicPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    if (pathname && pathname !== "/") {
      redirectUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (user && pathname === "/login") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
