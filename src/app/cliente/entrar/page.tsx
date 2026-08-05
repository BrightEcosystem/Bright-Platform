import { EntrarForm } from "./EntrarForm";

/** Tela Entrar (UX-001 §5.1) — login e cadastro reais via Supabase Auth (CORE-002.2). */
export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return <EntrarForm next={params.next} />;
}
