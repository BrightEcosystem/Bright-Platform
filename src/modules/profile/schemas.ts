import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(1, "Informe o nome.").max(120, "Nome muito longo."),
  avatarUrl: z
    .string()
    .trim()
    .url("URL inválida.")
    .max(2048, "URL muito longa.")
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
