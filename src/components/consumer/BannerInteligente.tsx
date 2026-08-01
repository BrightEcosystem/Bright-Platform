"use client";

import { useState } from "react";
import { Megaphone, Sparkles, Tag, X } from "lucide-react";

type BannerVariante = "novidade" | "campanha" | "promocao" | "aviso";

type BannerInteligenteProps = {
  titulo: string;
  mensagem: string;
  variante: BannerVariante;
};

const VARIANTE_CONFIG: Record<BannerVariante, { icone: typeof Megaphone; classes: string }> = {
  novidade: { icone: Sparkles, classes: "bg-consumer-primary/10 text-consumer-primary" },
  campanha: { icone: Megaphone, classes: "bg-consumer-secondary/15 text-amber-700" },
  promocao: { icone: Tag, classes: "bg-consumer-support/10 text-consumer-support" },
  aviso: { icone: Megaphone, classes: "bg-consumer-warning/10 text-consumer-warning" },
};

/** Banner Inteligente — novidades/campanhas/promoções/avisos (Central de Novidades, componente adicional DS-001 §11). */
export function BannerInteligente({ titulo, mensagem, variante }: BannerInteligenteProps) {
  const [visivel, setVisivel] = useState(true);
  if (!visivel) return null;

  const { icone: Icone, classes } = VARIANTE_CONFIG[variante];

  return (
    <div className={`flex items-start gap-3 rounded-xl p-4 ${classes}`}>
      <Icone className="size-5 shrink-0" aria-hidden="true" />
      <div className="flex-1">
        <p className="text-sm font-semibold">{titulo}</p>
        <p className="text-xs opacity-80">{mensagem}</p>
      </div>
      <button
        type="button"
        onClick={() => setVisivel(false)}
        aria-label="Dispensar aviso"
        className="shrink-0 rounded-full p-1 opacity-60 hover:opacity-100"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
