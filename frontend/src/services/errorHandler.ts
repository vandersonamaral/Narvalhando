import { Alert } from "react-native";

export interface ApiError {
  message: string;
  status?: number;
  field?: string;
}

export class ErrorHandler {
  static handle(error: any): ApiError {
    // Erro de resposta da API
    if (error.response) {
      const { status, data } = error.response;

      // Erro de validação
      if (status === 400) {
        return {
          message: data.error || "Dados inválidos. Verifique as informações.",
          status,
          field: data.field,
        };
      }

      // Não autorizado
      if (status === 401) {
        return {
          message: "Sessão expirada. Faça login novamente.",
          status,
        };
      }

      // Não encontrado
      if (status === 404) {
        return {
          message: data.error || "Recurso não encontrado.",
          status,
        };
      }


      if (status === 409) {
        return {
          message: data.error || "Este registro já existe.",
          status,
        };
      }

      // Erro do servidor
      if (status >= 500) {
        return {
          message: data.error || data.details || "Erro no servidor. Tente novamente mais tarde.",
          status,
        };
      }

      return {
        message: data.error || "Ocorreu um erro. Tente novamente.",
        status,
      };
    }

    // Erro de rede
    if (error.request) {
      return {
        message: "Sem conexão com o servidor. Verifique sua internet.",
      };
    }

    // Erro desconhecido
    return {
      message: error.message || "Ocorreu um erro inesperado.",
    };
  }

  static showAlert(error: any, title: string = "Erro"): void {
    const apiError = this.handle(error);
    Alert.alert(title, apiError.message);
  }

  static getMessage(error: any): string {
    return this.handle(error).message;
  }
}
