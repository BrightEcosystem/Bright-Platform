import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Entrar</h1>
      <LoginForm next={params.next} />
      <div className="mt-4 text-sm">
        <Link href="/esqueci-minha-senha" className="text-neutral-400 hover:text-neutral-200">
          Esqueci minha senha
        </Link>
      </div>
    </div>
  );
}
