"use client";

import { useActionState } from "react";
import { Botao } from "@/components/consumer/Botao";
import { updateConsumerPassword, type ConsumerActionState } from "@/services/consumer-auth/actions";

const initialState: ConsumerActionState = { error: null };

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(updateConsumerPassword, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm text-consumer-text">
        Nova senha
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="min-h-[44px] rounded-xl border border-consumer-border px-4 text-sm text-consumer-text outline-none focus-visible:border-consumer-primary"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-consumer-text">
        Confirmar nova senha
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="min-h-[44px] rounded-xl border border-consumer-border px-4 text-sm text-consumer-text outline-none focus-visible:border-consumer-primary"
        />
      </label>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <Botao type="submit" carregando={isPending} className="mt-2 w-full">
        Redefinir senha
      </Botao>
    </form>
  );
}
