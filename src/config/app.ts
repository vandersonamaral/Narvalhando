import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import {
  validatorCompiler,
  serializerCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import jwt from "@fastify/jwt";

import {registerRoutes} from "../auth/register";
import {authMiddleware} from "../middleware/auth";
import loginRoute from "../auth/login";



const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(jwt, {
  secret: process.env.JWT_SECRET || "secret-super-seguro",
});
app.register(authMiddleware);
app.register(loginRoute);
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(fastifyCors, {
  origin: "*",
});
app.register(registerRoutes);

export default app;
