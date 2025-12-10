import { FastifyInstance } from "fastify";
import { prisma } from "../config/prismaClient";
import { z } from "zod";

const dateQuerySchema = z.object({
  date: z.string().refine((v) => !isNaN(Date.parse(v)), {
    message: "Invalid date format",
  }),
});

export default async function reportsController(app: FastifyInstance) {
  app.get("/reports/appointments-by-service", async (request, reply) => {
    const rawData = await prisma.appointment.groupBy({
      by: ["serviceId"],
      _count: { id: true },
    });

    const serviceIds = rawData.map((i) => i.serviceId);

    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, name: true, price: true },
    });

    const map = new Map(
      services.map((s) => [s.id, { name: s.name, price: s.price }])
    );

    const result = rawData.map((i) => ({
      serviceId: i.serviceId,
      serviceName: map.get(i.serviceId)?.name || "Unknown",
      appointmentCount: i._count.id,
      totalRevenue: i._count.id * (map.get(i.serviceId)?.price || 0),
    }));

    return reply.send(result);
  });

  app.get("/reports/appointments-by-barber", async (request, reply) => {
    const rawData = await prisma.appointment.groupBy({
      by: ["barberId"],
      _count: { id: true },
    });

    const barberIds = rawData.map((i) => i.barberId);

    const barbers = await prisma.barber.findMany({
      where: { id: { in: barberIds } },
      select: { id: true, name: true },
    });

    const map = new Map(barbers.map((b) => [b.id, b.name]));

    const result = rawData.map((i) => ({
      barberId: i.barberId,
      barberName: map.get(i.barberId) || "Unknown",
      appointmentCount: i._count.id,
    }));

    return reply.send(result);
  });

  app.get("/reports/appointments-by-date", async (request, reply) => {
    const parsed = dateQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply
        .status(400)
        .send({ error: "Invalid date", details: parsed.error.format() });
    }

    const date = new Date(parsed.data.date);
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.count({
      where: { date: { gte: start, lte: end } },
    });

    return reply.send({ date: parsed.data.date, appointments });
  });

  app.get("/reports/total-appointments", async () => {
    const count = await prisma.appointment.count();
    return { totalAppointments: count };
  });

  app.get("/reports/weekly-summary", async () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    start.setHours(0, 0, 0, 0);

    const appointments = await prisma.appointment.findMany({
      where: { date: { gte: start, lte: now } },
      include: { service: true },
    });

    const total = appointments.length;

    const revenue = appointments.reduce(
      (acc, ap) => acc + (ap.service?.price || 0),
      0
    );

    return {
      period: "Last 7 days",
      totalAppointments: total,
      totalRevenue: revenue,
    };
  });

  app.get("/reports/monthly-summary", async () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);

    const appointments = await prisma.appointment.findMany({
      where: { date: { gte: start, lte: now } },
      include: { service: true },
    });

    const total = appointments.length;

    const revenue = appointments.reduce(
      (acc, ap) => acc + (ap.service?.price || 0),
      0
    );

    return {
      month: now.toLocaleString("pt-BR", { month: "long", year: "numeric" }),
      totalAppointments: total,
      totalRevenue: revenue,
    };
  });

  app.get("/reports/popular-hours", async () => {
    const appointments = await prisma.appointment.findMany();

    const hourMap: Record<string, number> = {};

    appointments.forEach((a) => {
      const hour = new Date(a.date).getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });

    const result = Object.entries(hourMap).map(([hour, count]) => ({
      hour: `${hour}:00`,
      appointmentCount: count,
    }));

    return result.sort((a, b) => b.appointmentCount - a.appointmentCount);
  });
}
