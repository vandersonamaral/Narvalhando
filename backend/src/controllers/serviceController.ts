import { FastifyInstance } from "fastify";
import { prisma } from "../config/prismaClient";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { serviceSchema, idSchema } from "../schemas/serviceSchema";

export default async function serviceController(app: FastifyInstance) {
  app.post(
    "/service",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const parsed = serviceSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply
          .status(400)
          .send({ error: "Dados inválidos", details: parsed.error.format() });
      }
      const { name, price, duration } = parsed.data;
      const service = await prisma.service.create({
        data: { name, price, duration: duration },
      });
      return reply.status(201).send(service);
    }
  );

  app.get(
    "/service",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const services = await prisma.service.findMany();
      return reply.send(services);
    }
  );

  app.put(
    "/service/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const idParsed = idSchema.safeParse(request.params);
      if (!idParsed.success) {
        return reply
          .status(400)
          .send({ error: "ID inválido", details: idParsed.error.format() });
      }
      const serviceParsed = serviceSchema.safeParse(request.body);
      if (!serviceParsed.success) {
        return reply.status(400).send({
          error: "Dados inválidos",
          details: serviceParsed.error.format(),
        });
      }
      const { id } = idParsed.data;
      const { name, price, duration } = serviceParsed.data;
      const updatedService = await prisma.service.update({
        where: { id },
        data: { name, price, duration },
      });
      return reply.send(updatedService);
    }
  );

  app.delete(
    "/service/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const parsed = idSchema.safeParse(request.params);

      if (!parsed.success) {
        return reply
          .status(400)
          .send({ error: "ID inválido", details: parsed.error.format() });
      }
      const { id } = parsed.data;
      await prisma.service.delete({
        where: { id },
      });
      return reply.status(204).send();
    }
  );
}
