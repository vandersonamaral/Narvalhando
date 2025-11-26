import { FastifyInstance } from "fastify";
import { prisma } from "../config/prismaClient";
import bcrypt from "bcrypt";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function registerRoutes(app: FastifyInstance) {
  app.post("/register", async (request, reply) => {
    const parse = RegisterSchema.safeParse(request.body);

    if (!parse.success) {
      return reply.status(400).send({
        error: "Dados inválidos",
        details: parse.error.flatten(),
      });
    }

    const { name, email, password } = parse.data;

    try {
      const existing = await prisma.barber.findUnique({
        where: { email },
      });

      if (existing) {
        return reply.status(400).send({ error: "Email já cadastrado" });
      }

      const hashed = await bcrypt.hash(password, 10);

      const barber = await prisma.barber.create({
        data: {
          name,
          email,
          password: hashed,
        },
      });

      const token = app.jwt.sign({
        id: barber.id,
        name: barber.name,
        email: barber.email,
      });

      return reply.status(201).send({
        token,
      });

    } catch (error) {
      console.error("Erro ao registrar:", error);
      return reply.status(500).send({ error: "Erro ao registrar usuário" });
    }
  });
}
