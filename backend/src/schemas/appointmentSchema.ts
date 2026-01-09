import { z } from "zod";

export const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const paymentTypeEnum = z.enum(["PENDING", "PIX", "CARD", "CASH"]);

export const appointmentCreateSchema = z.object({
  date: z.string().refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    },
    { message: "Data inválida" }
  ),
  clientId: z.number().int().positive({ message: "ID do cliente inválido" }),
  serviceId: z.number().int().positive({ message: "ID do serviço inválido" }),
  barberId: z.number().int().positive({ message: "ID do barbeiro inválido" }),
  paymentType: paymentTypeEnum.optional().default("PENDING"),
});

export const appointmentUpdateSchema = z.object({
  date: z.string().datetime().optional(),
  serviceId: z.number().int().positive().optional(),
  notes: z.string().optional(),
  paymentType: paymentTypeEnum.optional(),
});

export const statusSchema = z.object({
  status: z.enum(["SCHEDULED", "CANCELED", "COMPLETED"]),
});

export const paymentSchema = z.object({
  paymentType: paymentTypeEnum,
});

export const dateQuerySchema = z.object({
  date: z.string().refine((d) => !isNaN(Date.parse(d)), {
    message: "Data inválida (use formato YYYY-MM-DD)",
  }),
});
