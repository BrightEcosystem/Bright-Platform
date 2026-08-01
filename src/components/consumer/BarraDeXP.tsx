type BarraDeXPProps = {
  xpAtual: number;
  xpProximoNivel: number;
  subiuDeNivel?: boolean;
};

/** Barra de XP até o próximo nível — componente adicional exigido pela Direção (DS-001 §11). */
export function BarraDeXP({ xpAtual, xpProximoNivel, subiuDeNivel = false }: BarraDeXPProps) {
  const percentual = xpProximoNivel > 0 ? Math.min(100, Math.round((xpAtual / xpProximoNivel) * 100)) : 0;

  return (
    <div className={subiuDeNivel ? "animate-consumer-level-up" : undefined}>
      <div className="mb-1 flex items-center justify-between text-xs text-consumer-text-muted">
        <span>{xpAtual} XP</span>
        <span>{xpProximoNivel} XP</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={xpAtual}
        aria-valuemin={0}
        aria-valuemax={xpProximoNivel}
        aria-label="Progresso de XP até o próximo nível"
        className="h-2 w-full overflow-hidden rounded-full bg-consumer-bg-subtle"
      >
        <div
          className="h-full rounded-full bg-consumer-secondary transition-all duration-500"
          style={{ width: `${percentual}%` }}
        />
      </div>
    </div>
  );
}
