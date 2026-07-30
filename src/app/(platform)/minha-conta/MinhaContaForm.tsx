"use client";

import { useActionState } from "react";
import { updateMyProfile, type UpdateProfileState } from "@/services/profile/actions";

const initialState: UpdateProfileState = { error: null, success: false };

type MinhaContaFormProps = {
  fullName: string | null;
  avatarUrl: string | null;
};

export function MinhaContaForm({ fullName, avatarUrl }: MinhaContaFormProps) {
  const [state, formAction, pending] = useActionState(updateMyProfile, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
      <h2 className="mb-4 text-sm font-medium text-neutral-200">Editar perfil</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="fullName" className="mb-1 block text-sm text-neutral-400">
            Nome completo
          </label>
          <input
            id="fullName"
            name="fullName"
            defaultValue={fullName ?? ""}
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500"
          />
        </div>
        <div>
          <label htmlFor="avatarUrl" className="mb-1 block text-sm text-neutral-400">
            URL do avatar
          </label>
          <input
            id="avatarUrl"
            name="avatarUrl"
            defaultValue={avatarUrl ?? ""}
            placeholder="https://..."
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500"
          />
        </div>
        {state.error ? (
          <p role="alert" className="text-sm text-red-400">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p role="status" className="text-sm text-emerald-400">
            Perfil atualizado.
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-300 disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
