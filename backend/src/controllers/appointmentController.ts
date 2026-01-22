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
            { message: "Data inválida" },
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

        // Verificar conflito de horário - checando se já existe agendamento neste horário
        const serviceDuration = service.duration; // duração em minutos
        const appointmentEnd = new Date(
          appointmentDate.getTime() + serviceDuration * 60000,
        );

        // Buscar agendamentos que podem conflitar
        const conflictingAppointments = await prisma.appointment.findMany({
          where: {
            barberId,
            status: { in: ["SCHEDULED"] }, // Apenas agendamentos ativos
            date: {
              gte: new Date(appointmentDate.getTime() - 2 * 60 * 60000), // 2 horas antes
              lte: new Date(appointmentDate.getTime() + 2 * 60 * 60000), // 2 horas depois
            },
          },
          include: {
            service: true,
          },
        });

        // Verificar se há conflito real de horário
        for (const existing of conflictingAppointments) {
          const existingStart = new Date(existing.date);
          const existingEnd = new Date(
            existingStart.getTime() + existing.service.duration * 60000,
          );

          // Verifica se os horários se sobrepõem
          const hasConflict =
            (appointmentDate >= existingStart &&
              appointmentDate < existingEnd) ||
            (appointmentEnd > existingStart && appointmentEnd <= existingEnd) ||
            (appointmentDate <= existingStart && appointmentEnd >= existingEnd);

          if (hasConflict) {
            const conflictStartTime = existingStart.toLocaleTimeString(
              "pt-BR",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            );
            const conflictEndTime = existingEnd.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const requestedEndTime = appointmentEnd.toLocaleTimeString(
              "pt-BR",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            );
            const requestedStartTime = appointmentDate.toLocaleTimeString(
              "pt-BR",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            );

            return reply.status(409).send({
              error: `Horário indisponível!\n\nJá existe um agendamento de ${conflictStartTime} às ${conflictEndTime} (${existing.service.name}).\n\nO serviço solicitado (${service.name}) tem duração de ${serviceDuration} minutos (${requestedStartTime} - ${requestedEndTime}) e conflita com este horário.\n\nPor favor, escolha outro horário.`,
            });
          }
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
    },
  );

  app.get(
    "/appointment",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user as
        | { id: number; name: string; email: string }
        | undefined;
      const barberId = user?.id;

      if (!barberId) {
        return reply.status(401).send({ error: "Usuário não autenticado" });
      }

      return prisma.appointment.findMany({
        where: { barberId },
        include: {
          client: true,
          service: true,
          barber: true,
        },
      });
    },
  );

  app.get(
    "/appointment/:id",
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
      if (!parsed.success) return reply.status(400).send(parsed.error.format());

      const appointment = await prisma.appointment.findFirst({
        where: { id: parsed.data.id, barberId },
        include: {
          client: true,
          service: true,
          barber: true,
        },
      });

      if (!appointment)
        return reply.status(404).send({ error: "Agendamento não encontrado" });

      return reply.send(appointment);
    },
  );

  app.get(
    "/appointment/today",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user as
        | { id: number; name: string; email: string }
        | undefined;
      const barberId = user?.id;

      if (!barberId) {
        return reply.status(401).send({ error: "Usuário não autenticado" });
      }

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      return prisma.appointment.findMany({
        where: {
          barberId,
          date: { gte: startOfDay, lte: endOfDay },
        },
        include: {
          client: true,
          service: true,
          barber: true,
        },
      });
    },
  );

  app.get(
    "/appointment/future",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user as
        | { id: number; name: string; email: string }
        | undefined;
      const barberId = user?.id;

      if (!barberId) {
        return reply.status(401).send({ error: "Usuário não autenticado" });
      }

      const now = new Date();
      return prisma.appointment.findMany({
        where: { barberId, date: { gt: now } },
        include: {
          client: true,
          service: true,
          barber: true,
        },
      });
    },
  );

  app.get(
    "/appointment/by-date",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const parsed = dateQuerySchema.safeParse(request.query);
      if (!parsed.success) return reply.status(400).send(parsed.error.format());

      const date = new Date(parsed.data.date);

      const user = request.user as
        | { id: number; name: string; email: string }
        | undefined;
      const barberId = user?.id;

      if (!barberId) {
        return reply.status(401).send({ error: "Usuário não autenticado" });
      }

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const appointments = await prisma.appointment.findMany({
        where: { barberId, date: { gte: start, lte: end } },
        include: {
          client: true,
          service: true,
          barber: true,
        },
      });

      return reply.send(appointments);
    },
  );

  app.get(
    "/appointment/by-client/:id",
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
      if (!parsed.success) return reply.status(400).send(parsed.error.format());

      const { id } = parsed.data;

      const appointments = await prisma.appointment.findMany({
        where: { clientId: id, barberId },
        include: {
          client: true,
          service: true,
          barber: true,
        },
      });

      return reply.send(appointments);
    },
  );

  app.get(
    "/appointment/status/:status",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user as
        | { id: number; name: string; email: string }
        | undefined;
      const barberId = user?.id;

      if (!barberId) {
        return reply.status(401).send({ error: "Usuário não autenticado" });
      }

      const schema = z.object({
        status: statusSchema.shape.status,
      });

      const parsed = schema.safeParse(request.params);
      if (!parsed.success) return reply.status(400).send(parsed.error.format());

      const { status } = parsed.data;

      return prisma.appointment.findMany({
        where: { barberId, status },
        include: {
          client: true,
          service: true,
          barber: true,
        },
      });
    },
  );

  app.put(
    "/appointment/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user as
        | { id: number; name: string; email: string }
        | undefined;
      const barberId = user?.id;

      if (!barberId) {
        return reply.status(401).send({ error: "Usuário não autenticado" });
      }

      const idParsed = idSchema.safeParse(request.params);
      if (!idParsed.success)
        return reply.status(400).send(idParsed.error.format());

      const bodyParsed = appointmentUpdateSchema.safeParse(request.body);
      if (!bodyParsed.success)
        return reply.status(400).send(bodyParsed.error.format());

      // Verifica se o agendamento pertence ao barbeiro
      const existingAppointment = await prisma.appointment.findFirst({
        where: { id: idParsed.data.id, barberId },
      });

      if (!existingAppointment) {
        return reply.status(404).send({ error: "Agendamento não encontrado" });
      }

      const { date, serviceId, paymentType } = bodyParsed.data;

      const updateData: any = {};
      if (date) updateData.date = new Date(date);
      if (serviceId) updateData.serviceId = serviceId;
      if (paymentType) updateData.paymentType = paymentType;

      // Se está alterando data ou serviço, verificar conflito de horário
      if (date || serviceId) {
        const appointmentDate = date
          ? new Date(date)
          : existingAppointment.date;
        const newServiceId = serviceId || existingAppointment.serviceId;

        const service = await prisma.service.findUnique({
          where: { id: newServiceId },
        });

        if (!service) {
          return reply.status(404).send({ error: "Serviço não encontrado" });
        }

        const serviceDuration = service.duration;
        const appointmentEnd = new Date(
          appointmentDate.getTime() + serviceDuration * 60000,
        );

        // Buscar agendamentos que podem conflitar (excluindo o próprio agendamento sendo editado)
        const conflictingAppointments = await prisma.appointment.findMany({
          where: {
            barberId,
            id: { not: idParsed.data.id }, // Excluir o agendamento atual
            status: { in: ["SCHEDULED"] },
            date: {
              gte: new Date(appointmentDate.getTime() - 2 * 60 * 60000),
              lte: new Date(appointmentDate.getTime() + 2 * 60 * 60000),
            },
          },
          include: {
            service: true,
          },
        });

        // Verificar se há conflito real de horário
        for (const existing of conflictingAppointments) {
          const existingStart = new Date(existing.date);
          const existingEnd = new Date(
            existingStart.getTime() + existing.service.duration * 60000,
          );

          const hasConflict =
            (appointmentDate >= existingStart &&
              appointmentDate < existingEnd) ||
            (appointmentEnd > existingStart && appointmentEnd <= existingEnd) ||
            (appointmentDate <= existingStart && appointmentEnd >= existingEnd);

          if (hasConflict) {
            const conflictStartTime = existingStart.toLocaleTimeString(
              "pt-BR",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            );
            const conflictEndTime = existingEnd.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const requestedEndTime = appointmentEnd.toLocaleTimeString(
              "pt-BR",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            );
            const requestedStartTime = appointmentDate.toLocaleTimeString(
              "pt-BR",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            );

            return reply.status(409).send({
              error: `Horário indisponível!\n\nJá existe um agendamento de ${conflictStartTime} às ${conflictEndTime} (${existing.service.name}).\n\nO serviço solicitado (${service.name}) tem duração de ${serviceDuration} minutos (${requestedStartTime} - ${requestedEndTime}) e conflita com este horário.\n\nPor favor, escolha outro horário.`,
            });
          }
        }
      }

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
    },
  );

  app.patch(
    "/appointment/:id/status",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user as
        | { id: number; name: string; email: string }
        | undefined;
      const barberId = user?.id;

      if (!barberId) {
        return reply.status(401).send({ error: "Usuário não autenticado" });
      }

      const idParsed = idSchema.safeParse(request.params);
      if (!idParsed.success)
        return reply.status(400).send(idParsed.error.format());

      const statusParsed = statusSchema.safeParse(request.body);
      if (!statusParsed.success)
        return reply.status(400).send(statusParsed.error.format());

      // Verifica se o agendamento pertence ao barbeiro
      const existingAppointment = await prisma.appointment.findFirst({
        where: { id: idParsed.data.id, barberId },
      });

      if (!existingAppointment) {
        return reply.status(404).send({ error: "Agendamento não encontrado" });
      }

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
    },
  );

  app.put(
    "/appointment/:id/complete",
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
      if (!parsed.success) return reply.status(400).send(parsed.error.format());

      // Verifica se o agendamento pertence ao barbeiro
      const existingAppointment = await prisma.appointment.findFirst({
        where: { id: parsed.data.id, barberId },
      });

      if (!existingAppointment) {
        return reply.status(404).send({ error: "Agendamento não encontrado" });
      }

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
    },
  );

  app.patch(
    "/appointment/:id/payment",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user as
        | { id: number; name: string; email: string }
        | undefined;
      const barberId = user?.id;

      if (!barberId) {
        return reply.status(401).send({ error: "Usuário não autenticado" });
      }

      const idParsed = idSchema.safeParse(request.params);
      if (!idParsed.success)
        return reply.status(400).send(idParsed.error.format());

      const paymentSchema = z.object({
        paymentType: z.enum(["PENDING", "PIX", "CARD", "CASH"]),
      });

      const bodyParsed = paymentSchema.safeParse(request.body);
      if (!bodyParsed.success)
        return reply.status(400).send(bodyParsed.error.format());

      // Verifica se o agendamento pertence ao barbeiro
      const existingAppointment = await prisma.appointment.findFirst({
        where: { id: idParsed.data.id, barberId },
      });

      if (!existingAppointment) {
        return reply.status(404).send({ error: "Agendamento não encontrado" });
      }

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
    },
  );

  app.delete(
    "/appointment/:id",
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
      if (!parsed.success) return reply.status(400).send(parsed.error.format());

      // Verifica se o agendamento pertence ao barbeiro
      const existingAppointment = await prisma.appointment.findFirst({
        where: { id: parsed.data.id, barberId },
      });

      if (!existingAppointment) {
        return reply.status(404).send({ error: "Agendamento não encontrado" });
      }

      await prisma.appointment.delete({ where: { id: parsed.data.id } });
      return reply.status(204).send();
    },
  );
}
