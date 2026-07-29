import Link from "next/link";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold">Esqueci minha senha</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Informe seu e-mail e enviaremos um link para redefinir sua senha.
      </p>
      <ForgotPasswordForm />
      <div className="mt-4 text-sm">
        <Link href="/login" className="text-neutral-400 hover:text-neutral-200">
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
