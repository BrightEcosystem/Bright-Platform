import { CartaoDeSaldo } from "@/components/consumer/CartaoDeSaldo";
import { ItemDeExtrato } from "@/components/consumer/ItemDeExtrato";
import { EstadoVazio } from "@/components/consumer/EstadoVazio";
import { mockContaFidelidade, mockLancamentos } from "@/services/mock";

/** Tela Carteira (UX-001 §5.4) — saldo completo e extrato de Lançamentos. */
export default function CarteiraPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-6">
      <h1 className="text-xl font-bold text-consumer-text">Carteira</h1>

      <CartaoDeSaldo conta={mockContaFidelidade} />

      <section>
        <h2 className="mb-2 text-sm font-semibold text-consumer-text">Extrato</h2>
        {mockLancamentos.length > 0 ? (
          <div className="rounded-xl border border-consumer-border bg-consumer-bg px-4">
            {mockLancamentos.map((lancamento) => (
              <ItemDeExtrato key={lancamento.id} lancamento={lancamento} />
            ))}
          </div>
        ) : (
          <EstadoVazio
            titulo="Nenhum lançamento ainda"
            descricao="Suas compras e recompensas aparecerão aqui."
            variante="primeiro-acesso"
          />
        )}
      </section>
    </div>
  );
}
