import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().min(2),
  price: z.number(),
  duration: z.number(),
});

const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});
export { serviceSchema, idSchema };
