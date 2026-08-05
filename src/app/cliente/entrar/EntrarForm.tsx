"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Botao } from "@/components/consumer/Botao";
import {
  signInConsumer,
  signUpConsumer,
  type ConsumerActionState,
  type ConsumerSignUpState,
} from "@/services/consumer-auth/actions";

const initialLoginState: ConsumerActionState = { error: null };
const initialSignUpState: ConsumerSignUpState = { error: null, aguardandoConfirmacao: false };

export function EntrarForm({ next }: { next?: string }) {
  const [modo, setModo] = useState<"entrar" | "criar-conta">("entrar");

  const [loginState, loginAction, loginPending] = useActionState(signInConsumer, initialLoginState);
  const [signUpState, signUpAction, signUpPending] = useActionState(signUpConsumer, initialSignUpState);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 px-6 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-consumer-primary text-white">
          <Sparkles className="size-7" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-bold text-consumer-text">Bright</h1>
        <p className="text-sm text-consumer-text-muted">
          Acompanhe seu cashback, missões e recompensas em um só lugar.
        </p>
      </div>

      {modo === "entrar" ? (
        <form action={loginAction} className="flex flex-col gap-3">
          {next ? <input type="hidden" name="next" value={next} /> : null}
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
          <label className="flex flex-col gap-1 text-sm text-consumer-text">
            Senha
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="min-h-[44px] rounded-xl border border-consumer-border px-4 text-sm text-consumer-text outline-none focus-visible:border-consumer-primary"
            />
          </label>

          {loginState.error ? <p className="text-sm text-red-600">{loginState.error}</p> : null}

          <Botao type="submit" carregando={loginPending} className="mt-2 w-full">
            Entrar
          </Botao>

          <Link
            href="/cliente/esqueci-senha"
            className="text-center text-sm text-consumer-primary hover:underline"
          >
            Esqueci minha senha
          </Link>
        </form>
      ) : (
        <form action={signUpAction} className="flex flex-col gap-3">
          {signUpState.aguardandoConfirmacao ? (
            <p className="text-sm text-consumer-text">
              Enviamos um link de confirmação para o seu e-mail. Abra-o para concluir o cadastro.
            </p>
          ) : (
            <>
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
              <label className="flex flex-col gap-1 text-sm text-consumer-text">
                Senha
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="min-h-[44px] rounded-xl border border-consumer-border px-4 text-sm text-consumer-text outline-none focus-visible:border-consumer-primary"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-consumer-text">
                Confirmar senha
                <input
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="min-h-[44px] rounded-xl border border-consumer-border px-4 text-sm text-consumer-text outline-none focus-visible:border-consumer-primary"
                />
              </label>

              {signUpState.error ? <p className="text-sm text-red-600">{signUpState.error}</p> : null}

              <Botao type="submit" carregando={signUpPending} className="mt-2 w-full">
                Criar conta
              </Botao>
            </>
          )}
        </form>
      )}

      <Botao
        variante="texto"
        onClick={() => setModo(modo === "entrar" ? "criar-conta" : "entrar")}
        className="w-full"
      >
        {modo === "entrar" ? "Primeiro acesso? Criar conta" : "Já tenho conta — Entrar"}
      </Botao>
    </div>
  );
}
