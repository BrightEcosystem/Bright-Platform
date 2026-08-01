import { CardDeRecompensa } from "@/components/consumer/CardDeRecompensa";
import { BadgeSelo } from "@/components/consumer/BadgeSelo";
import { EstadoVazio } from "@/components/consumer/EstadoVazio";
import { mockBeneficios, mockContaFidelidade } from "@/services/mock";

const formatoNumero = new Intl.NumberFormat("pt-BR");

/** Tela Benefícios (UX-001 §5.7) — Marketplace de Benefícios. */
export default function BeneficiosPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="text-xl font-bold text-consumer-text">Marketplace de Benefícios</h1>
        <p className="text-sm text-consumer-text-muted">
          Você tem {formatoNumero.format(mockContaFidelidade.saldoPontos)} pontos disponíveis.
        </p>
      </div>

      {mockBeneficios.length > 0 ? (
        <div className="flex flex-col gap-3">
          {mockBeneficios.map((item) => (
            <div key={item.id} className={item.disponivel ? "" : "opacity-50"}>
              <div className="flex items-center justify-between gap-2">
                <CardDeRecompensa
                  titulo={item.titulo}
                  descricao={`${item.descricao} · ${formatoNumero.format(item.custoPontos)} pontos`}
                  variante="brinde"
                />
                {!item.disponivel && <BadgeSelo label="Indisponível" tom="neutro" />}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EstadoVazio titulo="Nenhum benefício disponível" descricao="Volte em breve para novos benefícios." />
      )}
    </div>
  );
}
