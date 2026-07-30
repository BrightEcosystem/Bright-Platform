"use server";

import { revalidatePath } from "next/cache";
import { withPermission } from "@/lib/auth/protected-action";
import { updateProfileSchema } from "@/modules/profile/schemas";

export type UpdateProfileState = { error: string | null; success: boolean };

/**
 * Atualiza o perfil do próprio usuário autenticado. Nunca aceita um `userId`
 * vindo do formulário — o alvo do `update` é sempre `ctx.userId`, resolvido
 * pelo `withPermission` a partir da sessão validada no servidor. Isso garante
 * que a ação é sempre "self-only", mesmo que um cliente malicioso injete um
 * id de outro usuário no formulário.
 */
export async function updateMyProfile(
  _prevState: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    avatarUrl: formData.get("avatarUrl"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos.", success: false };
  }

  return withPermission("user.profile.update", null, async (ctx, supabase) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.fullName,
        avatar_url: parsed.data.avatarUrl || null,
      })
      .eq("id", ctx.userId);

    if (error) {
      return { error: "Não foi possível atualizar o perfil.", success: false };
    }

    revalidatePath("/minha-conta");
    return { error: null, success: true };
  });
}
