type AvatarProps = {
  nome: string;
  fotoUrl?: string | null;
  tamanho?: "sm" | "md" | "lg";
};

const TAMANHO_CLASSES: Record<NonNullable<AvatarProps["tamanho"]>, string> = {
  sm: "size-8 text-xs",
  md: "size-11 text-sm",
  lg: "size-16 text-lg",
};

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1]?.[0] ?? "" : "";
  return (primeira + ultima).toUpperCase();
}

/** Avatar do consumidor — foto quando disponível, iniciais como fallback (DS-001 §11). */
export function Avatar({ nome, fotoUrl, tamanho = "md" }: AvatarProps) {
  if (fotoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- foto vinda de URL externa arbitrária (mock), sem domínio fixo para next/image
      <img
        src={fotoUrl}
        alt={nome}
        className={`rounded-full object-cover ${TAMANHO_CLASSES[tamanho]}`}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={nome}
      className={`inline-flex items-center justify-center rounded-full bg-consumer-primary font-semibold text-white ${TAMANHO_CLASSES[tamanho]}`}
    >
      {iniciais(nome)}
    </span>
  );
}
