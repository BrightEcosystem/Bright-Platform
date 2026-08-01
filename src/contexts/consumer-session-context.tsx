"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "bright-consumer-mock-session";

type ConsumerSessionValue = {
  autenticado: boolean;
  carregando: boolean;
  entrar: () => void;
  sair: () => void;
};

const ConsumerSessionContext = createContext<ConsumerSessionValue | null>(null);

/**
 * Sessão mockada do consumidor — apenas estado local (localStorage), sem autenticação real,
 * sem chamada ao Supabase. APP-001 não conecta identidade real de consumidor (IDENT-001 fica para fase futura).
 */
export function ConsumerSessionProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState({ autenticado: false, carregando: true });

  useEffect(() => {
    // Sincroniza com o localStorage (sistema externo) uma única vez, na montagem no cliente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEstado({ autenticado: window.localStorage.getItem(STORAGE_KEY) === "true", carregando: false });
  }, []);
  const { autenticado, carregando } = estado;

  const entrar = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setEstado({ autenticado: true, carregando: false });
  }, []);

  const sair = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setEstado({ autenticado: false, carregando: false });
  }, []);

  return (
    <ConsumerSessionContext.Provider value={{ autenticado, carregando, entrar, sair }}>
      {children}
    </ConsumerSessionContext.Provider>
  );
}

export function useConsumerSession(): ConsumerSessionValue {
  const context = useContext(ConsumerSessionContext);
  if (!context) {
    throw new Error("useConsumerSession deve ser usado dentro de ConsumerSessionProvider");
  }
  return context;
}
