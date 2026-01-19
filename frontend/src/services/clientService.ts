import { api } from "./api";

export interface Client {
  id: number;
  name: string;
  phone?: string;
  createdAt: string;
}

export const clientService = {
  async getAll(): Promise<Client[]> {
    try {
      const response = await api.get<Client[]>("/clientes");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao buscar clientes");
    }
  },

  async getById(id: number): Promise<Client> {
    try {
      const response = await api.get<Client>(`/clientes/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao buscar cliente");
    }
  },

  async getByName(name: string): Promise<Client[]> {
    try {
      const response = await api.get<Client[]>(`/clientes/nome/${name}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao buscar cliente");
    }
  },

  async create(data: { name: string; phone?: string }): Promise<Client> {
    try {
      const response = await api.post<Client>("/clientes", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao criar cliente");
    }
  },

  async update(
    id: number,
    data: { name: string; phone?: string }
  ): Promise<Client> {
    try {
      const response = await api.put<Client>(`/clientes/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Erro ao atualizar cliente"
      );
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/clientes/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao excluir cliente");
    }
  },
};
