import { CardDeMissao } from "@/components/consumer/CardDeMissao";
import { EstadoVazio } from "@/components/consumer/EstadoVazio";
import { mockMissoes } from "@/services/mock";

/** Tela Missões (UX-001 §5.5) — lista completa de missões, em andamento e concluídas. */
export default function MissoesPage() {
  const emAndamento = mockMissoes.filter((missao) => !missao.concluida);
  const concluidas = mockMissoes.filter((missao) => missao.concluida);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-6">
      <h1 className="text-xl font-bold text-consumer-text">Missões</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-consumer-text">Em andamento</h2>
        {emAndamento.length > 0 ? (
          emAndamento.map((missao) => <CardDeMissao key={missao.id} missao={missao} />)
        ) : (
          <EstadoVazio titulo="Nenhuma missão em andamento" descricao="Volte em breve para novas missões." />
        )}
      </section>

      {concluidas.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-consumer-text">Concluídas</h2>
          {concluidas.map((missao) => (
            <CardDeMissao key={missao.id} missao={missao} />
          ))}
        </section>
      )}
    </div>
  );
}
