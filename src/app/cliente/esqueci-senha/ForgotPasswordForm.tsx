"use client";

import { useActionState } from "react";
import { Botao } from "@/components/consumer/Botao";
import {
  requestConsumerPasswordReset,
  type ConsumerForgotPasswordState,
} from "@/services/consumer-auth/actions";

const initialState: ConsumerForgotPasswordState = { error: null, success: false };

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestConsumerPasswordReset, initialState);

  if (state.success) {
    return (
      <p className="text-sm text-consumer-text">
        Se este e-mail estiver cadastrado, enviamos um link para redefinir a senha.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm text-consumer-text">
        E-mail
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="voce@email.com"
          className="min-h-[44px] rounded-xl border border-consumer-border px-4 text-sm text-consumer-text outline-none focus-visible:border-consumer-primary"
        />
      </label>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <Botao type="submit" carregando={isPending} className="mt-2 w-full">
        Enviar link de recuperação
      </Botao>
    </form>
  );
}
