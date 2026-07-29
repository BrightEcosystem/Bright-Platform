"use client";

import { useActionState } from "react";
import { signIn, type ActionState } from "@/services/auth/actions";

const initialState: ActionState = { error: null };

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

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

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm text-neutral-400">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
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
        {isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
