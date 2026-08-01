type BarraDeProgressoProps = {
  atual: number;
  meta: number;
  corClassName?: string;
};

/** Barra de progresso genérica (ex.: progresso de missão) — distinta da Barra de XP (DS-001 §11). */
export function BarraDeProgresso({ atual, meta, corClassName = "bg-consumer-primary" }: BarraDeProgressoProps) {
  const percentual = meta > 0 ? Math.min(100, Math.round((atual / meta) * 100)) : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={atual}
      aria-valuemin={0}
      aria-valuemax={meta}
      className="h-2 w-full overflow-hidden rounded-full bg-consumer-bg-subtle"
    >
      <div
        className={`h-full rounded-full transition-all duration-300 ${corClassName}`}
        style={{ width: `${percentual}%` }}
      />
    </div>
  );
}
