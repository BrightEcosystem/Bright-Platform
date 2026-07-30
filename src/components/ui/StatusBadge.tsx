type StatusTone = "positive" | "neutral" | "negative";

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
};

const TONE_CLASSES: Record<StatusTone, string> = {
  positive: "border-emerald-900 bg-emerald-950 text-emerald-400",
  neutral: "border-neutral-700 bg-neutral-800 text-neutral-300",
  negative: "border-red-900 bg-red-950 text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  suspended: "Suspenso",
  inactive: "Inativo",
  removed: "Removido",
};

const POSITIVE_STATUSES = new Set(["active"]);
const NEGATIVE_STATUSES = new Set(["suspended", "removed", "inactive"]);

/** Traduz um valor bruto de status do banco (ex.: `active`) para um rótulo em PT-BR. */
export function labelForStatus(status: string | null | undefined): string {
  if (!status) return "Desconhecido";
  return STATUS_LABELS[status.toLowerCase()] ?? status;
}

/** Deriva o tom visual (positivo/neutro/negativo) a partir de um status bruto do banco. */
export function toneForStatus(status: string | null | undefined): StatusTone {
  if (!status) return "neutral";
  const normalized = status.toLowerCase();
  if (POSITIVE_STATUSES.has(normalized)) return "positive";
  if (NEGATIVE_STATUSES.has(normalized)) return "negative";
  return "neutral";
}

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}
