import { Upload } from "lucide-react";
import { BadgeSelo } from "@/components/consumer/BadgeSelo";
import { Botao } from "@/components/consumer/Botao";
import { EstadoVazio } from "@/components/consumer/EstadoVazio";
import { mockComprovantes } from "@/services/mock";
import type { StatusComprovante } from "@/types/consumer";

const STATUS_LABEL: Record<StatusComprovante, string> = {
  em_analise: "Em análise",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

const STATUS_TOM: Record<StatusComprovante, "sucesso" | "atencao" | "erro"> = {
  em_analise: "atencao",
  aprovado: "sucesso",
  rejeitado: "erro",
};

const formatoMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });

/** Tela Comprovantes (UX-001 §5.8) — envio e status de comprovantes de compra. */
export default function ComprovantesPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-consumer-text">Comprovantes</h1>
        <Botao variante="secundario" className="px-3">
          <Upload className="size-4" aria-hidden="true" />
          Enviar
        </Botao>
      </div>

      {mockComprovantes.length > 0 ? (
        <div className="flex flex-col gap-3">
          {mockComprovantes.map((comprovante) => (
            <div
              key={comprovante.id}
              className="flex items-center justify-between rounded-xl border border-consumer-border bg-consumer-bg p-4"
            >
              <div>
                <p className="text-sm font-semibold text-consumer-text">{comprovante.estabelecimento}</p>
                <p className="text-xs text-consumer-text-muted">
                  {formatoMoeda.format(comprovante.valor)} · {formatoData.format(new Date(comprovante.data))}
                </p>
              </div>
              <BadgeSelo label={STATUS_LABEL[comprovante.status]} tom={STATUS_TOM[comprovante.status]} />
            </div>
          ))}
        </div>
      ) : (
        <EstadoVazio
          titulo="Nenhum comprovante enviado"
          descricao="Envie o comprovante da sua compra para validar o cashback."
          variante="primeiro-acesso"
        />
      )}
    </div>
  );
}
