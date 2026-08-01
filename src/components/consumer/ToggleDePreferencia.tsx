"use client";

type ToggleDePreferenciaProps = {
  rotulo: string;
  ativo: boolean;
  onChange: (valor: boolean) => void;
};

/** Toggle de Preferência — ativar/desativar notificação por tipo (Configurações, DS-001 §11). */
export function ToggleDePreferencia({ rotulo, ativo, onChange }: ToggleDePreferenciaProps) {
  return (
    <label className="flex min-h-[44px] items-center justify-between gap-4 py-2">
      <span className="text-sm text-consumer-text">{rotulo}</span>
      <button
        type="button"
        role="switch"
        aria-checked={ativo}
        aria-label={rotulo}
        onClick={() => onChange(!ativo)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          ativo ? "bg-consumer-primary" : "bg-consumer-border"
        }`}
      >
        <span
          className={`absolute top-1 size-5 rounded-full bg-white transition-transform ${
            ativo ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}
