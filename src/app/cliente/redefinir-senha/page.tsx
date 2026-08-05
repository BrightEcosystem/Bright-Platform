import { ResetPasswordForm } from "./ResetPasswordForm";

/** Redefinição de senha do consumidor (CORE-002.2) — rota técnica, fora do mapa de 12 telas de UX-001. */
export default function ConsumerResetPasswordPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-10">
      <div className="text-center">
        <h1 className="mb-2 text-xl font-bold text-consumer-text">Redefinir senha</h1>
        <p className="text-sm text-consumer-text-muted">Escolha uma nova senha para sua conta.</p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
