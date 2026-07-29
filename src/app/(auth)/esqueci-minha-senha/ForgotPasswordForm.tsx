"use client";

import { useActionState } from "react";
import { requestPasswordReset, type ForgotPasswordState } from "@/services/auth/actions";

const initialState: ForgotPasswordState = { error: null, success: false };

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState);

  if (state.success) {
    return (
      <p className="text-sm text-neutral-300">
        Se este e-mail estiver cadastrado, enviamos um link para redefinir a senha.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm text-neutral-400">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600"
        />
      </div>

      {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-white disabled:opacity-60"
      >
        {isPending ? "Enviando..." : "Enviar link de recuperação"}
      </button>
    </form>
  );
}
