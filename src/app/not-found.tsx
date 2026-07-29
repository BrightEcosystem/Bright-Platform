import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-neutral-950 text-neutral-100">
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <p className="text-neutral-400">O endereço acessado não existe na Bright Platform.</p>
      <Link href="/dashboard" className="text-sm text-blue-400 hover:underline">
        Voltar para o Dashboard
      </Link>
    </div>
  );
}
