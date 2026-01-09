import { z } from "zod";

export const clienteSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z
    .string()
    .max(15, "Telefone deve ter no máximo 15 caracteres")
    .optional()
    .transform((val) => (val && val.trim() !== "" ? val : undefined)), // Converte string vazia em undefined
});

export const nameSchema = z.object({
  name: z.string().min(1),
});

export const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});
