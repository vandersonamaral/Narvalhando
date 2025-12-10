import { FastifyInstance } from "fastify";
import { prisma } from "../config/prismaClient";
import { z } from "zod";

/* ---------------------------------------------
   SCHEMAS (SEM DUPLICAÇÃO)
--------------------------------------------- */
const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const appointmentCreateSchema = z.object({
  date: z.string().datetime(),
  clientId: z.number().int().positive(),
  serviceId: z.number().int().positive(),
  barberId: z.number().int().positive(),
});

// Enum unificado
const statusSchema = z.object({
  status: z.enum(["SCHEDULED", "CANCELED", "COMPLETED"]),
});

// Usado no filtro /by-date
const dateQuerySchema = z.object({
  date: z.string().refine((d) => !isNaN(Date.parse(d)), {
    message: "Data inválida (use formato YYYY-MM-DD)",
  }),
});

export default async function appointmentController(app: FastifyInstance) {
  app.post("/appointment", async (request, reply) => {
    const parsed = appointmentCreateSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send(parsed.error.format());

    const { date, clientId, serviceId, barberId } = parsed.data;

    if (!(await prisma.client.findUnique({ where: { id: clientId } })))
      return reply.status(404).send({ error: "Cliente não encontrado" });

    if (!(await prisma.service.findUnique({ where: { id: serviceId } })))
      return reply.status(404).send({ error: "Serviço não encontrado" });

    if (!(await prisma.barber.findUnique({ where: { id: barberId } })))
      return reply.status(404).send({ error: "Barbeiro não encontrado" });

    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        clientId,
        serviceId,
        barberId,
        status: "SCHEDULED",
      },
    });

    return reply.status(201).send(appointment);
  });

  app.get("/appointment", async () => {
    return prisma.appointment.findMany({
      include: {
        client: true,
        service: true,
        barber: true,
      },
    });
  });

  app.get("/appointment/today", async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.appointment.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
      },
    });
  });

  app.get("/appointment/future", async () => {
    const now = new Date();
    return prisma.appointment.findMany({
      where: { date: { gt: now } },
    });
  });

  app.get("/appointment/by-date", async (request, reply) => {
    const parsed = dateQuerySchema.safeParse(request.query);
    if (!parsed.success) return reply.status(400).send(parsed.error.format());

    const date = new Date(parsed.data.date);

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: { date: { gte: start, lte: end } },
    });

    return reply.send(appointments);
  });

  app.get("/appointment/by-client/:id", async (request, reply) => {
    const parsed = idSchema.safeParse(request.params);
    if (!parsed.success) return reply.status(400).send(parsed.error.format());

    const { id } = parsed.data;

    const appointments = await prisma.appointment.findMany({
      where: { clientId: id },
    });

    return reply.send(appointments);
  });

  app.get("/appointment/status/:status", async (request, reply) => {
    const schema = z.object({
      status: statusSchema.shape.status,
    });

    const parsed = schema.safeParse(request.params);
    if (!parsed.success) return reply.status(400).send(parsed.error.format());

    const { status } = parsed.data;

    return prisma.appointment.findMany({
      where: { status },
    });
  });

  app.patch("/appointment/:id/status", async (request, reply) => {
    const idParsed = idSchema.safeParse(request.params);
    if (!idParsed.success)
      return reply.status(400).send(idParsed.error.format());

    const statusParsed = statusSchema.safeParse(request.body);
    if (!statusParsed.success)
      return reply.status(400).send(statusParsed.error.format());

    const appointment = await prisma.appointment.update({
      where: { id: idParsed.data.id },
      data: { status: statusParsed.data.status },
    });

    return reply.send(appointment);
  });

  app.put("/appointment/:id/complete", async (request, reply) => {
    const parsed = idSchema.safeParse(request.params);
    if (!parsed.success) return reply.status(400).send(parsed.error.format());

    const appointment = await prisma.appointment.update({
      where: { id: parsed.data.id },
      data: { status: "COMPLETED" },
    });

    return reply.send(appointment);
  });

  app.delete("/appointment/:id", async (request, reply) => {
    const parsed = idSchema.safeParse(request.params);
    if (!parsed.success) return reply.status(400).send(parsed.error.format());

    await prisma.appointment.delete({ where: { id: parsed.data.id } });
    return reply.status(204).send();
  });
}
