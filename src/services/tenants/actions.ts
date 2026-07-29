"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACTIVE_TENANT_COOKIE, getAuthContext } from "@/lib/auth/session";

/**
 * Define a empresa ativa do usuário. Nunca confia no `tenantId` recebido do
 * formulário sem revalidar contra os memberships ativos reais do usuário,
 * consultados de novo agora — evita que alguém force um tenant ao qual não
 * pertence só manipulando o valor enviado.
 */
export async function selectActiveTenant(formData: FormData): Promise<void> {
  const tenantId = formData.get("tenantId");

  const ctx = await getAuthContext();
  if (!ctx) {
    redirect("/login");
  }

  const belongsToTenant =
    typeof tenantId === "string" && ctx.memberships.some((m) => m.tenantId === tenantId);

  if (!belongsToTenant) {
    redirect("/selecionar-empresa");
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_TENANT_COOKIE, tenantId as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/dashboard");
}
