import app from "./config/app";

const PORT = 3000;

app
  .listen({ port: PORT })
  .then(() => {
    console.log(`Server is running on port ${PORT}`);
  })
  .catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
  });
