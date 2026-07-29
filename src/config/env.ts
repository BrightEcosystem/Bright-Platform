import { z } from "zod";

/**
 * Variáveis seguras para o navegador (prefixo NEXT_PUBLIC_).
 * Nunca adicionar aqui nada que não deva ser exposto ao cliente.
 */
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

/**
 * Variáveis restritas ao servidor. NUNCA importar `getServerEnv` a partir de
 * um Client Component ("use client") ou de qualquer código que rode no navegador.
 */
const serverSchema = publicSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_PROJECT_REF: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
});

export type PublicEnv = z.infer<typeof publicSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

/**
 * Seguro para uso em Client e Server Components.
 * Lança erro de validação se as variáveis públicas estiverem ausentes/inválidas.
 */
export const publicEnv: PublicEnv = publicSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

/**
 * Uso exclusivo em Server Components, Server Actions e Route Handlers.
 * Nunca chamar a partir de um Client Component.
 */
export function getServerEnv(): ServerEnv {
  return serverSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_PROJECT_REF: process.env.SUPABASE_PROJECT_REF,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
  });
}
