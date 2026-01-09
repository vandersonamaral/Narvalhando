import "dotenv/config";
import app from "./config/app";

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app
  .listen({ port: PORT, host: HOST })
  .then(() => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  })
  .catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
  });
