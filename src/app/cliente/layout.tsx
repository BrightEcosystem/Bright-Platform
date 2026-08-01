import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "@/styles/consumer-theme.css";
import { ConsumerSessionProvider } from "@/contexts/consumer-session-context";
import { ConsumerShell } from "@/components/consumer/ConsumerShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bright — Aplicativo do Consumidor",
  description: "Carteira, cashback, missões e benefícios do seu programa de fidelidade.",
};

/**
 * Layout do Aplicativo do Consumidor (DS-001) — tema claro/Mobile First próprio,
 * isolado do tema escuro da Retaguarda (BE-001 §12). Não altera src/app/layout.tsx.
 */
export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={inter.className}>
      <ConsumerSessionProvider>
        <ConsumerShell>{children}</ConsumerShell>
      </ConsumerSessionProvider>
    </div>
  );
}
