import { FastifyInstance } from "fastify";
import { prisma } from "../config/prismaClient";
import { z } from "zod";

const clienteSchema = z.object({
  name: z.string().min(2),
  phone: z.string().max(15).optional(),
});

const nameSchema = z.object({
  name: z.string().min(1),
});

const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export default async function clienteController(app: FastifyInstance) {
  // CREATE
  app.post("/clientes", async (request, reply) => {
    const parsed = clienteSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Dados inválidos",
        details: parsed.error.format(),
      });
    }

    const { name, phone } = parsed.data;

    if (phone) {
      const existing = await prisma.client.findUnique({ where: { phone } });

      if (existing) {
        return reply.status(409).send({ error: "Telefone já cadastrado" });
      }
    }

    const client = await prisma.client.create({
      data: {
        name,
        phone: phone ?? "",
      },
    });

    return reply.send(client);
  });

  // GET ALL
  app.get("/clientes", async () => {
    return await prisma.client.findMany();
  });

  // GET BY ID
  app.get("/clientes/:id", async (request, reply) => {
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
  });

  // GET BY NAME
  app.get("/clientes/nome/:name", async (request, reply) => {
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
  });

  // UPDATE
  app.put("/clientes/:id", async (request, reply) => {
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

    if (phone && phone !== existingClient.phone) {
      const existingPhone = await prisma.client.findUnique({
        where: { phone },
      });

      if (existingPhone) {
        return reply.status(409).send({ error: "Telefone já cadastrado" });
      }
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        name,
        phone: phone !== undefined ? phone : undefined,
      },
    });

    return reply.send(updatedClient);
  });

  // DELETE
  app.delete("/clientes/:id", async (request, reply) => {
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
  });
}
