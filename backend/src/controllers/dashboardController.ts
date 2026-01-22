import { FastifyInstance } from "fastify";
import { prisma } from "../config/prismaClient";
import { authenticate } from "../middleware/auth";

export async function dashboardRoutes(app: FastifyInstance) {
  app.get(
    "/dashboard/overview",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user as
        | { id: number; name: string; email: string }
        | undefined;
      const barberId = user?.id;

      if (!barberId) {
        return reply.status(401).send({ error: "Usuário não autenticado" });
      }

      const totalClients = await prisma.client.count();
      const totalServices = await prisma.service.count();
      const totalAppointments = await prisma.appointment.count({
        where: { barberId },
      });
      const completedAppointments = await prisma.appointment.count({
        where: { barberId, status: "COMPLETED" },
      });

      return {
        totalClients,
        totalServices,
        totalAppointments,
        completedAppointments,
      };
    },
  );

  app.get(
    "/dashboard/revenue",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user as
        | { id: number; name: string; email: string }
        | undefined;
      const barberId = user?.id;

      if (!barberId) {
        return reply.status(401).send({ error: "Usuário não autenticado" });
      }

      const finished = await prisma.appointment.findMany({
        where: { barberId, status: "COMPLETED" },
        include: {
          service: {
            select: { price: true },
          },
        },
      });

      const totalRevenue = finished.reduce(
        (sum, ap) => sum + ap.service.price,
        0,
      );

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthRevenue = finished
        .filter((ap) => {
          const d = new Date(ap.date);
          return (
            d.getMonth() === currentMonth && d.getFullYear() === currentYear
          );
        })
        .reduce((sum, ap) => sum + ap.service.price, 0);

      return {
        totalRevenue,
        monthRevenue,
      };
    },
  );

  app.get(
    "/dashboard/upcoming-appointments",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user as
        | { id: number; name: string; email: string }
        | undefined;
      const barberId = user?.id;

      if (!barberId) {
        return reply.status(401).send({ error: "Usuário não autenticado" });
      }

      const data = await prisma.appointment.findMany({
        where: { barberId, status: "SCHEDULED" }, // ✔ corrigido
        orderBy: { date: "asc" },
        take: 5,
        include: {
          client: { select: { name: true } },
          service: { select: { name: true } },
        },
      });

      return data;
    },
  );

  app.get(
    "/dashboard/popular-services",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user as
        | { id: number; name: string; email: string }
        | undefined;
      const barberId = user?.id;

      if (!barberId) {
        return reply.status(401).send({ error: "Usuário não autenticado" });
      }

      const data = await prisma.appointment.groupBy({
        by: ["serviceId"],
        where: { barberId },
        _count: { serviceId: true },
        orderBy: {
          _count: { serviceId: "desc" },
        },
        take: 5,
      });

      const result = await Promise.all(
        data.map(async (item) => {
          const service = await prisma.service.findUnique({
            where: { id: item.serviceId },
            select: { name: true },
          });

          return {
            serviceId: item.serviceId,
            serviceName: service?.name ?? "Unknown",
            quantity: item._count.serviceId,
          };
        }),
      );

      return result;
    },
  );
}
