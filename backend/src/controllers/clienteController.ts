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

      // Se o telefone foi fornecido, verificar se já existe
      // Mas apenas se não for vazio/null
      if (phone && phone.trim()) {
        const existing = await prisma.client.findUnique({
          where: { phone: phone.trim() },
        });

        if (existing) {
          return reply.status(409).send({
            error: "Este telefone já está cadastrado para outro cliente",
          });
        }
      }

      try {
        const client = await prisma.client.create({
          data: {
            name: name.trim(),
            phone: phone && phone.trim() ? phone.trim() : null,
          },
        });

        return reply.send(client);
      } catch (error: any) {
        // Se houver erro de constraint unique no telefone
        if (error.code === "P2002" && error.meta?.target?.includes("phone")) {
          return reply.status(409).send({
            error: "Este telefone já está cadastrado para outro cliente",
          });
        }
        throw error;
      }
    },
  );

  app.get(
    "/clientes",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user as
        | { id: number; name: string; email: string }
        | undefined;
      const barberId = user?.id;

      if (!barberId) {
        return reply.status(401).send({ error: "Usuário não autenticado" });
      }

      // Retorna clientes que têm pelo menos 1 agendamento com este barbeiro
      const clients = await prisma.client.findMany({
        where: {
          appointments: {
            some: {
              barberId,
            },
          },
        },
      });

      return clients;
    },
  );

  app.get(
    "/clientes/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user as
        | { id: number; name: string; email: string }
        | undefined;
      const barberId = user?.id;

      if (!barberId) {
        return reply.status(401).send({ error: "Usuário não autenticado" });
      }

      const parsed = idSchema.safeParse(request.params);

      if (!parsed.success) {
        return reply.status(400).send({
          error: "ID inválido",
          details: parsed.error.format(),
        });
      }

      const client = await prisma.client.findFirst({
        where: {
          id: parsed.data.id,
          appointments: {
            some: {
              barberId,
            },
          },
        },
      });

      if (!client) {
        return reply.status(404).send({ error: "Cliente não encontrado" });
      }

      return reply.send(client);
    },
  );

  app.get(
    "/clientes/nome/:name",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user as
        | { id: number; name: string; email: string }
        | undefined;
      const barberId = user?.id;

      if (!barberId) {
        return reply.status(401).send({ error: "Usuário não autenticado" });
      }

      const { name } = nameSchema.parse(request.params);

      const clients = await prisma.client.findMany({
        where: {
          name: { contains: name, mode: "insensitive" },
          appointments: {
            some: {
              barberId,
            },
          },
        },
      });

      if (clients.length === 0) {
        return reply.status(404).send({ error: "Cliente não encontrado" });
      }

      return reply.send(clients);
    },
  );

  app.put(
    "/clientes/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user as
        | { id: number; name: string; email: string }
        | undefined;
      const barberId = user?.id;

      if (!barberId) {
        return reply.status(401).send({ error: "Usuário não autenticado" });
      }

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

      // Verifica se o cliente tem agendamento com este barbeiro
      const existingClient = await prisma.client.findFirst({
        where: {
          id,
          appointments: {
            some: {
              barberId,
            },
          },
        },
      });

      if (!existingClient) {
        return reply.status(404).send({ error: "Cliente não encontrado" });
      }

      // Se está alterando o telefone, verificar se já existe em outro cliente
      if (phone && phone.trim()) {
        const phoneInUse = await prisma.client.findUnique({
          where: { phone: phone.trim() },
        });

        // Se o telefone já existe e não é do próprio cliente
        if (phoneInUse && phoneInUse.id !== id) {
          return reply.status(409).send({
            error: "Este telefone já está cadastrado para outro cliente",
          });
        }
      }

      try {
        const updatedClient = await prisma.client.update({
          where: { id },
          data: {
            name: name.trim(),
            phone: phone && phone.trim() ? phone.trim() : null,
          },
        });

        return reply.send(updatedClient);
      } catch (error: any) {
        // Se houver erro de constraint unique no telefone
        if (error.code === "P2002" && error.meta?.target?.includes("phone")) {
          return reply.status(409).send({
            error: "Este telefone já está cadastrado para outro cliente",
          });
        }
        throw error;
      }
    },
  );

  app.delete(
    "/clientes/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user as
        | { id: number; name: string; email: string }
        | undefined;
      const barberId = user?.id;

      if (!barberId) {
        return reply.status(401).send({ error: "Usuário não autenticado" });
      }

      const parsed = idSchema.safeParse(request.params);

      if (!parsed.success) {
        return reply.status(400).send({
          error: "ID inválido",
          details: parsed.error.format(),
        });
      }

      const id = parsed.data.id;

      // Verifica se o cliente tem agendamento com este barbeiro
      const existingClient = await prisma.client.findFirst({
        where: {
          id,
          appointments: {
            some: {
              barberId,
            },
          },
        },
      });

      if (!existingClient) {
        return reply.status(404).send({ error: "Cliente não encontrado" });
      }

      await prisma.client.delete({ where: { id } });

      return reply.status(204).send();
    },
  );
}
