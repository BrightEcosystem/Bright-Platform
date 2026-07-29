"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-neutral-950 text-neutral-100">
      <h1 className="text-2xl font-semibold">Algo deu errado</h1>
      <p className="max-w-md text-center text-sm text-neutral-400">
        Ocorreu um erro inesperado. A equipe técnica foi registrada internamente.
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700"
      >
        Tentar novamente
      </button>
    </div>
  );
}
