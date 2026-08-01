type BadgeTom = "sucesso" | "atencao" | "erro" | "neutro" | "em-breve";

type BadgeSeloProps = {
  label: string;
  tom?: BadgeTom;
};

const TOM_CLASSES: Record<BadgeTom, string> = {
  sucesso: "bg-consumer-support/10 text-consumer-support border-consumer-support/30",
  atencao: "bg-consumer-warning/10 text-consumer-warning border-consumer-warning/30",
  erro: "bg-consumer-danger/10 text-consumer-danger border-consumer-danger/30",
  neutro: "bg-consumer-bg-subtle text-consumer-text-muted border-consumer-border",
  "em-breve": "bg-consumer-secondary/15 text-amber-700 border-consumer-secondary/40",
};

/** Badge/Selo do Aplicativo do Consumidor, incluindo a variante obrigatória "Em breve" (UX-001 §5.6). */
export function BadgeSelo({ label, tom = "neutro" }: BadgeSeloProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TOM_CLASSES[tom]}`}
    >
      {label}
    </span>
  );
}
