"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/config/env";
import type { Database } from "./types";

/**
 * Cliente Supabase para uso em Client Components (código que roda no navegador).
 * Usa apenas variáveis públicas (NEXT_PUBLIC_) — nunca a service_role key.
 */
export function createClient() {
  return createBrowserClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
