import fastifyJwt from "@fastify/jwt";
import dotenv from "dotenv";
import type { FastifyReply, FastifyRequest, FastifyInstance } from "fastify";

dotenv.config();

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: number; name: string; email: string };
    user: {
      id: number;
      name: string;
      email: string;
    };
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

export async function authMiddleware(app: FastifyInstance) {
  app.decorate(
    "authenticate",
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
        // Após verificar o token, o request.user é populado automaticamente
      } catch (err) {
        reply.status(401).send({ error: "Token inválido" });
      }
    }
  );
}

// Helper function para usar nas rotas
export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    await request.jwtVerify();
    // Após verificar o token, o request.user é populado automaticamente
  } catch (err) {
    reply.status(401).send({ error: "Token inválido" });
  }
};
