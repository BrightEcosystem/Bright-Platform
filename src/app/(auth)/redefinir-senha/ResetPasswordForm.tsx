"use client";

import { useActionState } from "react";
import { updatePassword, type ActionState } from "@/services/auth/actions";

const initialState: ActionState = { error: null };

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePassword, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm text-neutral-400">
          Nova senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="confirmPassword" className="text-sm text-neutral-400">
          Confirmar nova senha
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600"
        />
      </div>

      {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-white disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Redefinir senha"}
      </button>
    </form>
  );
}
