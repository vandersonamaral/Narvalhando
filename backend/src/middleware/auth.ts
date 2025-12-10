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
      authenticate: any;
    }
  }

export async function authMiddleware(app: FastifyInstance) {

  app.decorate(
    "authenticate",
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({ error: "Token inválido" });
      }
    }
  );
}
