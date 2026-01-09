import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não está definida");
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

prisma
  .$connect()
  .then(() => {
    console.log("Banco de dados conectado com sucesso");
  })
  .catch((error) => {
    console.error("Erro ao conectar ao banco de dados:", error);
  });

export { prisma };
