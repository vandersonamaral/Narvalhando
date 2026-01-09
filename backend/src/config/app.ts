import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import {
  validatorCompiler,
  serializerCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import jwt from "@fastify/jwt";
import appointmentController from "../controllers/appointmentController";
import serviceController from "../controllers/serviceController";
import { registerRoutes } from "../auth/register";
import { authMiddleware } from "../middleware/auth";
import loginRoute from "../auth/login";
import clienteController from "../controllers/clienteController";
import { dashboardRoutes } from "../controllers/dashboardController";
import reportsController from "../controllers/reportsController";

const app = fastify().withTypeProvider<ZodTypeProvider>();


app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);


app.register(fastifyCors, {
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
});


app.register(jwt, {
  secret: process.env.JWT_SECRET || "default-secret-key-change-in-production"
});
app.register(authMiddleware);


app.register(loginRoute);
app.register(registerRoutes);
app.register(clienteController);
app.register(appointmentController);
app.register(serviceController);
app.register(dashboardRoutes);
app.register(reportsController);

export default app;
