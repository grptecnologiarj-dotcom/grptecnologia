import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * DeskControl — Proxy (Middleware no Next.js 16)
 * Protege rotas autenticadas e atualiza a sessão do Supabase.
 */

const protectedPaths = [
  "/dashboard", "/os", "/clientes", "/equipamentos", "/agenda",
  "/orcamentos", "/financeiro", "/estoque", "/configuracoes",
  "/usuarios", "/contratos", "/garantias", "/whatsapp", "/notificacoes", "/conhecimento", "/super-admin",
];
const authPaths = ["/login", "/registro"];

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  // Se o Supabase não estiver configurado, apenas segue (modo demo/dev)
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redireciona usuários autenticados para fora das páginas de auth
  if (user && authPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redireciona usuários não autenticados para o login
  if (!user && protectedPaths.some((p) => pathname.startsWith(p))) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Corre todas as rotas exceto:
     * - _next/static, _next/image, favicon
     * - arquivos públicos (com extensão)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};