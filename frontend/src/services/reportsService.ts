import { api } from "./api";

export interface AppointmentsByService {
  serviceId: number;
  serviceName: string;
  appointmentCount: number;
  totalRevenue: number;
}

export interface AppointmentsByBarber {
  barberId: number;
  barberName: string;
  appointmentCount: number;
}

export interface AppointmentsByDate {
  date: string;
  appointments: number;
}

export interface TotalAppointments {
  totalAppointments: number;
}

export interface WeeklySummary {
  totalAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  totalRevenue: number;
  averageRevenuePerDay: number;
}

export const reportsService = {
  async getAppointmentsByService(): Promise<AppointmentsByService[]> {
    try {
      const response = await api.get<AppointmentsByService[]>(
        "/reports/appointments-by-service"
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao buscar relatório por serviço"
      );
    }
  },

  async getAppointmentsByBarber(): Promise<AppointmentsByBarber[]> {
    try {
      const response = await api.get<AppointmentsByBarber[]>(
        "/reports/appointments-by-barber"
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao buscar relatório por barbeiro"
      );
    }
  },

  async getAppointmentsByDate(date: string): Promise<AppointmentsByDate> {
    try {
      const response = await api.get<AppointmentsByDate>(
        `/reports/appointments-by-date?date=${date}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao buscar relatório por data"
      );
    }
  },

  async getTotalAppointments(): Promise<TotalAppointments> {
    try {
      const response = await api.get<TotalAppointments>(
        "/reports/total-appointments"
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao buscar total de agendamentos"
      );
    }
  },

  async getWeeklySummary(): Promise<WeeklySummary> {
    try {
      const response = await api.get<WeeklySummary>("/reports/weekly-summary");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao buscar resumo semanal"
      );
    }
  },

  async getMonthlyReport(year: number, month: number): Promise<any> {
    try {
      const response = await api.get(
        `/reports/monthly?year=${year}&month=${month}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao buscar relatório mensal"
      );
    }
  },

  async getByPeriod(startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      // Buscar resumo semanal ou mensal dependendo do período
      const response = await api.get("/reports/weekly-summary");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao buscar relatório por período"
      );
    }
  },

  async getByService(
    startDate?: string,
    endDate?: string
  ): Promise<AppointmentsByService[]> {
    try {
      // Por enquanto, retorna todos os serviços (backend não tem filtro por período implementado)
      return await this.getAppointmentsByService();
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao buscar relatório por serviço"
      );
    }
  },
};
