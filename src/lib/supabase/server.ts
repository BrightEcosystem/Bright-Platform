import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/config/env";
import type { Database } from "./types";

/**
 * Cliente Supabase para uso em Server Components, Server Actions e Route Handlers.
 * Nunca importar este arquivo a partir de um Client Component ("use client").
 * Usa apenas variáveis públicas (NEXT_PUBLIC_) — a service_role key tem seu
 * próprio uso restrito (ver `getServerEnv` em `src/config/env.ts`), não é
 * utilizada aqui porque este client deve respeitar RLS como o usuário autenticado.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado a partir de um Server Component — a sessão é
            // atualizada pelo middleware nesse caso. Seguro ignorar.
          }
        },
      },
    },
  );
}
