import { IndicadorDeNivel } from "./IndicadorDeNivel";
import { BarraDeXP } from "./BarraDeXP";
import type { ContaFidelidade } from "@/types/consumer";

type CartaoDeSaldoProps = {
  conta: ContaFidelidade;
  variante?: "compacto" | "completo";
};

const formatoMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatoNumero = new Intl.NumberFormat("pt-BR");

/** Cartão de Saldo — saldo de cashback/pontos/nível da Conta Fidelidade (DS-001 §11). */
export function CartaoDeSaldo({ conta, variante = "completo" }: CartaoDeSaldoProps) {
  return (
    <div className="rounded-2xl bg-consumer-primary p-5 text-white shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-white/70">Saldo de cashback</p>
          <p className="text-3xl font-bold tracking-tight">{formatoMoeda.format(conta.saldoCashback)}</p>
        </div>
        <IndicadorDeNivel nivel={conta.nivel} />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-white/80">{formatoNumero.format(conta.saldoPontos)} pontos</span>
        <span className="text-white/70">{conta.empresaAtual.nomeFantasia}</span>
      </div>

      {variante === "completo" && (
        <div className="mt-4 [&_*]:text-white [&_[role=progressbar]]:bg-white/20">
          <BarraDeXP xpAtual={conta.xpAtual} xpProximoNivel={conta.xpProximoNivel} />
        </div>
      )}
    </div>
  );
}
