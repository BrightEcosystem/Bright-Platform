"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type ConsumerSessionValue = {
  usuario: User | null;
  carregando: boolean;
};

const ConsumerSessionContext = createContext<ConsumerSessionValue | null>(null);

/**
 * Sessão real do consumidor (CORE-002.2) — reflete a sessão do Supabase Auth
 * no cliente para uso de componentes de UI (ex.: mostrar o e-mail do usuário).
 * NÃO é responsável por proteger rotas: isso é feito no servidor (`src/proxy.ts`,
 * `auth.getUser()`), nunca apenas por este estado do React.
 */
export function ConsumerSessionProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<ConsumerSessionValue>({ usuario: null, carregando: true });

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setEstado({ usuario: data.user, carregando: false });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEstado({ usuario: session?.user ?? null, carregando: false });
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <ConsumerSessionContext.Provider value={estado}>{children}</ConsumerSessionContext.Provider>
  );
}

export function useConsumerSession(): ConsumerSessionValue {
  const context = useContext(ConsumerSessionContext);
  if (!context) {
    throw new Error("useConsumerSession deve ser usado dentro de ConsumerSessionProvider");
  }
  return context;
}
