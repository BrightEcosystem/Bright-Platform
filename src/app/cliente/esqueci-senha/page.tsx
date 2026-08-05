import Link from "next/link";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

/** Recuperação de senha do consumidor (CORE-002.2) — rota técnica, fora do mapa de 12 telas de UX-001. */
export default function ConsumerForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-10">
      <div className="text-center">
        <h1 className="mb-2 text-xl font-bold text-consumer-text">Esqueci minha senha</h1>
        <p className="text-sm text-consumer-text-muted">
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </p>
      </div>
      <ForgotPasswordForm />
      <Link href="/cliente/entrar" className="text-center text-sm text-consumer-primary hover:underline">
        Voltar para o login
      </Link>
    </div>
  );
}
