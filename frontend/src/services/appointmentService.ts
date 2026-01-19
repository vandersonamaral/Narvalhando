import { api } from "./api";
import { Client } from "./clientService";
import { Service } from "./serviceService";

export interface Barber {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export type PaymentType = "PENDING" | "PIX" | "CARD" | "CASH";

export interface Appointment {
  id: number;
  date: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELED";
  paymentType?: PaymentType;
  clientId: number;
  serviceId: number;
  barberId: number;
  createdAt: string;
  client?: Client;
  service?: Service;
  barber?: Barber;
}

export const appointmentService = {
  async getAll(): Promise<Appointment[]> {
    try {
      const response = await api.get<Appointment[]>("/appointment");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao buscar agendamentos"
      );
    }
  },

  async getById(id: number): Promise<Appointment> {
    try {
      const response = await api.get<Appointment>(`/appointment/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao buscar agendamento"
      );
    }
  },

  async getToday(): Promise<Appointment[]> {
    try {
      const response = await api.get<Appointment[]>("/appointment/today");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao buscar agendamentos de hoje"
      );
    }
  },

  async getFuture(): Promise<Appointment[]> {
    try {
      const response = await api.get<Appointment[]>("/appointment/future");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao buscar próximos agendamentos"
      );
    }
  },

  async getByDate(date: string): Promise<Appointment[]> {
    try {
      const response = await api.get<Appointment[]>(
        `/appointment/by-date?date=${date}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao buscar agendamentos por data"
      );
    }
  },

  async getByClient(clientId: number): Promise<Appointment[]> {
    try {
      const response = await api.get<Appointment[]>(
        `/appointment/by-client/${clientId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao buscar agendamentos do cliente"
      );
    }
  },

  async getByStatus(
    status: "SCHEDULED" | "COMPLETED" | "CANCELED"
  ): Promise<Appointment[]> {
    try {
      const response = await api.get<Appointment[]>(
        `/appointment/status/${status}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao buscar agendamentos por status"
      );
    }
  },

  async create(data: {
    date: string;
    clientId: number;
    serviceId: number;
    barberId: number;
    paymentType?: PaymentType;
  }): Promise<Appointment> {
    try {
      const response = await api.post<Appointment>("/appointment", data);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.details ||
        error.message ||
        "Erro ao criar agendamento";
      throw new Error(errorMessage);
    }
  },

  async update(
    id: number,
    data: {
      date?: string;
      serviceId?: number;
      notes?: string;
    }
  ): Promise<Appointment> {
    try {
      const response = await api.put<Appointment>(`/appointment/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao atualizar agendamento"
      );
    }
  },

  async updatePayment(
    id: number,
    paymentType: PaymentType
  ): Promise<Appointment> {
    try {
      const response = await api.patch<Appointment>(
        `/appointment/${id}/payment`,
        { paymentType }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao atualizar pagamento"
      );
    }
  },

  async updateStatus(
    id: number,
    status: "SCHEDULED" | "COMPLETED" | "CANCELED"
  ): Promise<Appointment> {
    try {
      const response = await api.patch<Appointment>(
        `/appointment/${id}/status`,
        { status }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao atualizar status do agendamento"
      );
    }
  },

  async complete(id: number): Promise<Appointment> {
    try {
      const response = await api.put<Appointment>(
        `/appointment/${id}/complete`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao completar agendamento"
      );
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/appointment/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao excluir agendamento"
      );
    }
  },
};
