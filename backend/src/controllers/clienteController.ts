import { FastifyInstance } from "fastify";
import { prisma } from "../config/prismaClient";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { clienteSchema, nameSchema, idSchema } from "../schemas/clienteShema";

export default async function clienteController(app: FastifyInstance) {
  app.post(
    "/clientes",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const parsed = clienteSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          error: "Dados inválidos",
          details: parsed.error.format(),
        });
      }

      const { name, phone } = parsed.data;

      if (phone && phone.trim()) {
        const existing = await prisma.client.findUnique({
          where: { phone: phone.trim() },
        });

        if (existing) {
          return reply.status(409).send({ error: "Telefone já cadastrado" });
        }
      }

      const client = await prisma.client.create({
        data: {
          name: name.trim(),
          phone: phone && phone.trim() ? phone.trim() : null,
        },
      });

      return reply.send(client);
    }
  );

  app.get("/clientes", { preHandler: [authenticate] }, async () => {
    return await prisma.client.findMany();
  });

  app.get(
    "/clientes/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const parsed = idSchema.safeParse(request.params);

      if (!parsed.success) {
        return reply.status(400).send({
          error: "ID inválido",
          details: parsed.error.format(),
        });
      }

      const client = await prisma.client.findUnique({
        where: { id: parsed.data.id },
      });

      if (!client) {
        return reply.status(404).send({ error: "Cliente não encontrado" });
      }

      return reply.send(client);
    }
  );

  app.get(
    "/clientes/nome/:name",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { name } = nameSchema.parse(request.params);

      const clients = await prisma.client.findMany({
        where: {
          name: { contains: name, mode: "insensitive" },
        },
      });

      if (clients.length === 0) {
        return reply.status(404).send({ error: "Cliente não encontrado" });
      }

      return reply.send(clients);
    }
  );

  app.put(
    "/clientes/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const params = idSchema.safeParse(request.params);

      if (!params.success) {
        return reply.status(400).send({
          error: "ID inválido",
          details: params.error.format(),
        });
      }

      const parsed = clienteSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          error: "Dados inválidos",
          details: parsed.error.format(),
        });
      }

      const id = params.data.id;
      const { name, phone } = parsed.data;

      const existingClient = await prisma.client.findUnique({ where: { id } });

      if (!existingClient) {
        return reply.status(404).send({ error: "Cliente não encontrado" });
      }

      const updatedClient = await prisma.client.update({
        where: { id },
        data: {
          name: name.trim(),
          phone: phone && phone.trim() ? phone.trim() : null,
        },
      });

      return reply.send(updatedClient);
    }
  );

  // DELETE
  app.delete(
    "/clientes/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const parsed = idSchema.safeParse(request.params);

      if (!parsed.success) {
        return reply.status(400).send({
          error: "ID inválido",
          details: parsed.error.format(),
        });
      }

      const id = parsed.data.id;

      const existingClient = await prisma.client.findUnique({ where: { id } });

      if (!existingClient) {
        return reply.status(404).send({ error: "Cliente não encontrado" });
      }

      await prisma.client.delete({ where: { id } });

      return reply.status(204).send();
    }
  );
}
