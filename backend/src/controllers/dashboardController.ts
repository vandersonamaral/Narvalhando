import { FastifyInstance } from "fastify";
import { prisma } from "../config/prismaClient";

export async function dashboardRoutes(app: FastifyInstance) {
  // 📌 1. Visão geral do sistema
  app.get("/dashboard/overview", async () => {
    const totalClients = await prisma.client.count();
    const totalServices = await prisma.service.count();
    const totalAppointments = await prisma.appointment.count();
    const completedAppointments = await prisma.appointment.count({
      where: { status: "COMPLETED" },
    });

    return {
      totalClients,
      totalServices,
      totalAppointments,
      completedAppointments,
    };
  });

  app.get("/dashboard/revenue", async () => {
    // Busca TODOS os agendamentos concluídos com o preço do serviço
    const finished = await prisma.appointment.findMany({
      where: { status: "COMPLETED" },
      include: {
        service: {
          select: { price: true },
        },
      },
    });

    // Soma total acumulado
    const totalRevenue = finished.reduce(
      (sum, ap) => sum + ap.service.price,
      0
    );

    // Faturamento do mês atual
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthRevenue = finished
      .filter((ap) => {
        const d = new Date(ap.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, ap) => sum + ap.service.price, 0);

    return {
      totalRevenue,
      monthRevenue,
    };
  });

  // 📌 3. Próximos agendamentos
  app.get("/dashboard/upcoming-appointments", async () => {
    const data = await prisma.appointment.findMany({
      where: { status: "SCHEDULED" }, // ✔ corrigido
      orderBy: { date: "asc" },
      take: 5,
      include: {
        client: { select: { name: true } },
        service: { select: { name: true } },
      },
    });

    return data;
  });

  // 📌 4. Serviços mais realizados
  app.get("/dashboard/popular-services", async () => {
    const data = await prisma.appointment.groupBy({
      by: ["serviceId"],
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
      })
    );

    return result;
  });
}
