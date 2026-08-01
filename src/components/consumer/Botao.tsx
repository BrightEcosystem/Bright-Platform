import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type BotaoVariante = "primario" | "secundario" | "texto";

type BotaoProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: BotaoVariante;
  carregando?: boolean;
};

const VARIANTE_CLASSES: Record<BotaoVariante, string> = {
  primario: "bg-consumer-primary text-white hover:bg-consumer-primary-strong",
  secundario: "border border-consumer-primary text-consumer-primary bg-transparent hover:bg-consumer-primary/5",
  texto: "text-consumer-primary bg-transparent hover:underline",
};

/** Botão do Aplicativo do Consumidor — DS-001 §11 (Primário/Secundário/Texto). */
export function Botao({
  variante = "primario",
  carregando = false,
  disabled,
  className = "",
  children,
  ...props
}: BotaoProps) {
  return (
    <button
      disabled={disabled || carregando}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTE_CLASSES[variante]} ${className}`}
      {...props}
    >
      {carregando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
