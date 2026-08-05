"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  consumerSignUpSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from "@/modules/auth/schemas";

export type ConsumerActionState = { error: string | null };
export type ConsumerSignUpState = { error: string | null; aguardandoConfirmacao: boolean };
export type ConsumerForgotPasswordState = { error: string | null; success: boolean };

async function getOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

function safeConsumerNext(next: FormDataEntryValue | null, fallback: string): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export async function signInConsumer(
  _prevState: ConsumerActionState,
  formData: FormData,
): Promise<ConsumerActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "E-mail ou senha incorretos." };
  }

  redirect(safeConsumerNext(formData.get("next"), "/cliente/inicio"));
}

export async function signUpConsumer(
  _prevState: ConsumerSignUpState,
  formData: FormData,
): Promise<ConsumerSignUpState> {
  const parsed = consumerSignUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos.", aguardandoConfirmacao: false };
  }

  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/cliente/onboarding`,
    },
  });

  if (error) {
    // Mensagem genérica — não confirma para um atacante se o e-mail já está cadastrado.
    return {
      error: "Não foi possível criar a conta. Verifique os dados e tente novamente.",
      aguardandoConfirmacao: false,
    };
  }

  // Se o projeto tiver confirmação de e-mail desabilitada, o cadastro já
  // retorna uma sessão válida — segue direto para o onboarding. Caso
  // contrário, não há sessão ainda: o usuário precisa confirmar o e-mail
  // primeiro (o link leva a /auth/callback?next=/cliente/onboarding).
  if (data.session) {
    redirect("/cliente/onboarding");
  }

  return { error: null, aguardandoConfirmacao: true };
}

export async function signOutConsumer(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/cliente/entrar");
}

export async function requestConsumerPasswordReset(
  _prevState: ConsumerForgotPasswordState,
  formData: FormData,
): Promise<ConsumerForgotPasswordState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos.", success: false };
  }

  const supabase = await createClient();
  const origin = await getOrigin();

  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/cliente/redefinir-senha`,
  });

  // Sempre retorna sucesso, mesmo que o e-mail não exista — evita confirmar
  // para um atacante quais e-mails estão cadastrados.
  return { error: null, success: true };
}

export async function updateConsumerPassword(
  _prevState: ConsumerActionState,
  formData: FormData,
): Promise<ConsumerActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { error: "Não foi possível redefinir a senha. Solicite um novo link de recuperação." };
  }

  redirect("/cliente/inicio");
}
