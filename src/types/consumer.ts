/** Tipos do domínio do Aplicativo do Consumidor (DATA-001), usados pela camada de mock em `services/mock`. */

export type NivelFidelidade = "bronze" | "prata" | "ouro";

export type ContaFidelidade = {
  id: string;
  nomeConsumidor: string;
  avatarUrl: string | null;
  empresaAtual: {
    id: string;
    nomeFantasia: string;
  };
  empresasVinculadas: Array<{ id: string; nomeFantasia: string }>;
  nivel: NivelFidelidade;
  xpAtual: number;
  xpProximoNivel: number;
  saldoCashback: number;
  saldoPontos: number;
  primeiroAcesso: boolean;
};

export type StatusLancamento =
  | "pendente"
  | "confirmado"
  | "disponivel"
  | "resgatado"
  | "expirado"
  | "estornado";

export type Lancamento = {
  id: string;
  tipo: "credito" | "debito";
  origem: string;
  descricao: string;
  valor: number;
  data: string;
  status: StatusLancamento;
};

export type ProgressoMissao = {
  atual: number;
  meta: number;
};

export type Missao = {
  id: string;
  titulo: string;
  descricao: string;
  progresso: ProgressoMissao;
  recompensaXp: number;
  recompensaDescricao: string;
  concluida: boolean;
};

export type ItemMarketplaceBeneficio = {
  id: string;
  titulo: string;
  descricao: string;
  custoPontos: number;
  categoria: string;
  disponivel: boolean;
};

export type StatusComprovante = "em_analise" | "aprovado" | "rejeitado";

export type Comprovante = {
  id: string;
  estabelecimento: string;
  valor: number;
  data: string;
  status: StatusComprovante;
};

export type StatusIndicacao = "enviada" | "cadastrada" | "recompensada";

export type Indicacao = {
  id: string;
  nomeIndicado: string;
  data: string;
  status: StatusIndicacao;
  recompensaPontos: number;
};

export type TipoNotificacao = "operacional" | "novidade";

export type Notificacao = {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
};

export type PreferenciaNotificacao = {
  chave: string;
  rotulo: string;
  ativo: boolean;
};
