import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma";

const connectionString = `${process.env.DATABASE_URL}`;

if (!connectionString) {
  console.error("❌ DATABASE_URL não está definida no arquivo .env");
  throw new Error("DATABASE_URL não está definida");
}

let adapter;
let prisma;

try {
  adapter = new PrismaPg({ connectionString });
  prisma = new PrismaClient({ adapter });
  prisma
    .$connect()
    .then(() => {
      
    })
    .catch((error) => {
      console.error("Erro ao conectar ao banco de dados:", error.message);
    });
} catch (error: any) {
  console.error("Erro ao inicializar Prisma Client:", error.message);
  throw error;
}

export { prisma };
