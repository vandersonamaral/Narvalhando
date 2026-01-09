import { FastifyInstance } from "fastify";
import { prisma } from "../config/prismaClient";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import {
  idSchema,
  appointmentCreateSchema,
  appointmentUpdateSchema,
  statusSchema,
  dateQuerySchema,
} from "../schemas/appointmentSchema";

export default async function appointmentController(app: FastifyInstance) {
  app.post(
    "/appointment",
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const user = request.user as
          | { id: number; name: string; email: string }
          | undefined;
        const barberId = user?.id;

        if (!barberId) {
          return reply.status(401).send({ error: "Usuário não autenticado" });
        }

        const bodySchema = z.object({
          date: z.string().refine(
            (val) => {
              const date = new Date(val);
              return !isNaN(date.getTime());
            },
            { message: "Data inválida" }
          ),
          clientId: z
            .number()
            .int()
            .positive({ message: "ID do cliente inválido" }),
          serviceId: z
            .number()
            .int()
            .positive({ message: "ID do serviço inválido" }),
          paymentType: z
            .enum(["PENDING", "PIX", "CARD", "CASH"])
            .optional()
            .default("PENDING"),
        });

        const parsed = bodySchema.safeParse(request.body);
        if (!parsed.success) {
          return reply.status(400).send(parsed.error.format());
        }

        const { date, clientId, serviceId, paymentType } = parsed.data;

        const client = await prisma.client.findUnique({
          where: { id: clientId },
        });
        if (!client) {
          return reply.status(404).send({ error: "Cliente não encontrado" });
        }

        const service = await prisma.service.findUnique({
          where: { id: serviceId },
        });
        if (!service) {
          return reply.status(404).send({ error: "Serviço não encontrado" });
        }

        const barber = await prisma.barber.findUnique({
          where: { id: barberId },
        });
        if (!barber) {
          return reply.status(404).send({ error: "Barbeiro não encontrado" });
        }

        const appointmentDate = new Date(date);

        if (isNaN(appointmentDate.getTime())) {
          return reply.status(400).send({ error: "Data inválida" });
        }

        const now = new Date();
        if (appointmentDate <= now) {
          return reply.status(400).send({
            error: "Não é possível agendar para datas passadas",
          });
        }

        const appointment = await prisma.appointment.create({
          data: {
            date: appointmentDate,
            clientId,
            serviceId,
            barberId,
            status: "SCHEDULED",
            paymentType: paymentType || "PENDING",
          },
          include: {
            client: true,
            service: true,
            barber: true,
          },
        });

        return reply.status(201).send(appointment);
      } catch (error: any) {
        console.error("Erro ao criar agendamento:", error);
        console.error("Stack trace:", error.stack);
        console.error("Request body:", request.body);

        if (error.code) {
          console.error("Prisma error code:", error.code);
        }

        return reply.status(500).send({
          error: "Erro ao criar agendamento",
          details: error.message || String(error),
        });
      }
    }
  );

  app.get("/appointment", { preHandler: [authenticate] }, async () => {
    return prisma.appointment.findMany({
      include: {
        client: true,
        service: true,
        barber: true,
      },
    });
  });

  app.get(
    "/appointment/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const parsed = idSchema.safeParse(request.params);
      if (!parsed.success) return reply.status(400).send(parsed.error.format());

      const appointment = await prisma.appointment.findUnique({
        where: { id: parsed.data.id },
        include: {
          client: true,
          service: true,
          barber: true,
        },
      });

      if (!appointment)
        return reply.status(404).send({ error: "Agendamento não encontrado" });

      return reply.send(appointment);
    }
  );

  app.get("/appointment/today", { preHandler: [authenticate] }, async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.appointment.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        client: true,
        service: true,
        barber: true,
      },
    });
  });

  app.get("/appointment/future", { preHandler: [authenticate] }, async () => {
    const now = new Date();
    return prisma.appointment.findMany({
      where: { date: { gt: now } },
      include: {
        client: true,
        service: true,
        barber: true,
      },
    });
  });

  app.get(
    "/appointment/by-date",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const parsed = dateQuerySchema.safeParse(request.query);
      if (!parsed.success) return reply.status(400).send(parsed.error.format());

      const date = new Date(parsed.data.date);

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const appointments = await prisma.appointment.findMany({
        where: { date: { gte: start, lte: end } },
        include: {
          client: true,
          service: true,
          barber: true,
        },
      });

      return reply.send(appointments);
    }
  );

  app.get(
    "/appointment/by-client/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const parsed = idSchema.safeParse(request.params);
      if (!parsed.success) return reply.status(400).send(parsed.error.format());

      const { id } = parsed.data;

      const appointments = await prisma.appointment.findMany({
        where: { clientId: id },
        include: {
          client: true,
          service: true,
          barber: true,
        },
      });

      return reply.send(appointments);
    }
  );

  app.get(
    "/appointment/status/:status",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const schema = z.object({
        status: statusSchema.shape.status,
      });

      const parsed = schema.safeParse(request.params);
      if (!parsed.success) return reply.status(400).send(parsed.error.format());

      const { status } = parsed.data;

      return prisma.appointment.findMany({
        where: { status },
        include: {
          client: true,
          service: true,
          barber: true,
        },
      });
    }
  );

  app.put(
    "/appointment/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const idParsed = idSchema.safeParse(request.params);
      if (!idParsed.success)
        return reply.status(400).send(idParsed.error.format());

      const bodyParsed = appointmentUpdateSchema.safeParse(request.body);
      if (!bodyParsed.success)
        return reply.status(400).send(bodyParsed.error.format());

      const { date, serviceId, paymentType } = bodyParsed.data;

      const updateData: any = {};
      if (date) updateData.date = new Date(date);
      if (serviceId) updateData.serviceId = serviceId;
      if (paymentType) updateData.paymentType = paymentType;

      const appointment = await prisma.appointment.update({
        where: { id: idParsed.data.id },
        data: updateData,
        include: {
          client: true,
          service: true,
          barber: true,
        },
      });

      return reply.send(appointment);
    }
  );

  app.patch(
    "/appointment/:id/status",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const idParsed = idSchema.safeParse(request.params);
      if (!idParsed.success)
        return reply.status(400).send(idParsed.error.format());

      const statusParsed = statusSchema.safeParse(request.body);
      if (!statusParsed.success)
        return reply.status(400).send(statusParsed.error.format());

      const appointment = await prisma.appointment.update({
        where: { id: idParsed.data.id },
        data: { status: statusParsed.data.status },
        include: {
          client: true,
          service: true,
          barber: true,
        },
      });

      return reply.send(appointment);
    }
  );

  app.put(
    "/appointment/:id/complete",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const parsed = idSchema.safeParse(request.params);
      if (!parsed.success) return reply.status(400).send(parsed.error.format());

      const appointment = await prisma.appointment.update({
        where: { id: parsed.data.id },
        data: { status: "COMPLETED" },
        include: {
          client: true,
          service: true,
          barber: true,
        },
      });

      return reply.send(appointment);
    }
  );

  app.patch(
    "/appointment/:id/payment",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const idParsed = idSchema.safeParse(request.params);
      if (!idParsed.success)
        return reply.status(400).send(idParsed.error.format());

      const paymentSchema = z.object({
        paymentType: z.enum(["PENDING", "PIX", "CARD", "CASH"]),
      });

      const bodyParsed = paymentSchema.safeParse(request.body);
      if (!bodyParsed.success)
        return reply.status(400).send(bodyParsed.error.format());

      const appointment = await prisma.appointment.update({
        where: { id: idParsed.data.id },
        data: { paymentType: bodyParsed.data.paymentType },
        include: {
          client: true,
          service: true,
          barber: true,
        },
      });

      return reply.send(appointment);
    }
  );

  app.delete(
    "/appointment/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const parsed = idSchema.safeParse(request.params);
      if (!parsed.success) return reply.status(400).send(parsed.error.format());

      await prisma.appointment.delete({ where: { id: parsed.data.id } });
      return reply.status(204).send();
    }
  );
}
