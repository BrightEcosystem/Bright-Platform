import { CartaoDeSaldo } from "@/components/consumer/CartaoDeSaldo";
import { BannerInteligente } from "@/components/consumer/BannerInteligente";
import { CardDeMissao } from "@/components/consumer/CardDeMissao";
import { EstadoVazio } from "@/components/consumer/EstadoVazio";
import { mockContaFidelidade, mockMissoes, mockNotificacoes } from "@/services/mock";

/** Tela Início (UX-001 §5.3) — visão geral: saldo, novidades e missões em destaque. */
export default function InicioPage() {
  const missoesEmDestaque = mockMissoes.filter((missao) => !missao.concluida).slice(0, 2);
  const novidades = mockNotificacoes.filter((notificacao) => notificacao.tipo === "novidade");

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-6">
      <div>
        <p className="text-sm text-consumer-text-muted">Olá, {mockContaFidelidade.nomeConsumidor.split(" ")[0]}</p>
        <h1 className="text-xl font-bold text-consumer-text">Sua fidelidade em um só lugar</h1>
      </div>

      <CartaoDeSaldo conta={mockContaFidelidade} />

      {novidades.length > 0 && (
        <div className="flex flex-col gap-2">
          {novidades.map((novidade) => (
            <BannerInteligente
              key={novidade.id}
              titulo={novidade.titulo}
              mensagem={novidade.mensagem}
              variante="novidade"
            />
          ))}
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-consumer-text">Missões em destaque</h2>
        {missoesEmDestaque.length > 0 ? (
          missoesEmDestaque.map((missao) => <CardDeMissao key={missao.id} missao={missao} />)
        ) : (
          <EstadoVazio titulo="Nenhuma missão ativa" descricao="Novas missões aparecerão aqui em breve." />
        )}
      </section>
    </div>
  );
}
