import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Troca o código de autenticação (link de e-mail: confirmação de cadastro
 * ou recuperação de senha) por uma sessão válida, via cookies.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // O destino pretendido (next) indica se o link era do Aplicativo do
  // Consumidor ou da Retaguarda — o erro deve devolver a pessoa para o
  // login correto, não sempre para o administrativo.
  const fallback = safeNext.startsWith("/cliente") ? "/cliente/entrar" : "/login";
  return NextResponse.redirect(`${origin}${fallback}?error=callback`);
}
