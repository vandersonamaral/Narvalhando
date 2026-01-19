import { api } from "./api";

export interface DashboardOverview {
  totalClients: number;
  totalServices: number;
  totalAppointments: number;
  completedAppointments: number;
}

export interface Revenue {
  totalRevenue: number;
  monthRevenue: number;
}

export interface UpcomingAppointment {
  id: number;
  date: string;
  status: string;
  client: { name: string };
  service: { name: string };
}

export interface PopularService {
  serviceId: number;
  serviceName: string;
  quantity: number;
}

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    try {
      const response = await api.get<DashboardOverview>("/dashboard/overview");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao buscar visão geral"
      );
    }
  },

  async getRevenue(): Promise<Revenue> {
    try {
      const response = await api.get<Revenue>("/dashboard/revenue");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao buscar faturamento"
      );
    }
  },

  async getUpcomingAppointments(): Promise<UpcomingAppointment[]> {
    try {
      const response = await api.get<UpcomingAppointment[]>(
        "/dashboard/upcoming-appointments"
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao buscar próximos agendamentos"
      );
    }
  },

  async getPopularServices(): Promise<PopularService[]> {
    try {
      const response = await api.get<PopularService[]>(
        "/dashboard/popular-services"
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao buscar serviços populares"
      );
    }
  },
};
