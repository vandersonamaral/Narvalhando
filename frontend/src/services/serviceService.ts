import { api } from "./api";

export interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
  createdAt: string;
}

export const serviceService = {
  async getAll(): Promise<Service[]> {
    try {
      const response = await api.get<Service[]>("/service");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao buscar serviços");
    }
  },

  async create(data: {
    name: string;
    price: number;
    duration: number;
  }): Promise<Service> {
    try {
      const response = await api.post<Service>("/service", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao criar serviço");
    }
  },

  async update(
    id: number,
    data: { name: string; price: number; duration: number }
  ): Promise<Service> {
    try {
      const response = await api.put<Service>(`/service/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao atualizar serviço"
      );
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/service/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao excluir serviço");
    }
  },
};
