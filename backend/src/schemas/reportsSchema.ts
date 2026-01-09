import { z } from "zod";
export const dateQuerySchema = z.object({
  date: z.string().refine((v) => !isNaN(Date.parse(v)), {
    message: "Invalid date format",
  }),
});