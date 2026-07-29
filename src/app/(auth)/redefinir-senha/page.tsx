import { ResetPasswordForm } from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold">Redefinir senha</h1>
      <p className="mb-6 text-sm text-neutral-400">Escolha uma nova senha para sua conta.</p>
      <ResetPasswordForm />
    </div>
  );
}
