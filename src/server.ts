import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app";
import { createServer } from "http";
import { initializeSocketService } from "./models/socket.service";

const requiredEnv = ["MONGO_URL", "SESSION_SECRET", "SECRET_TOKEN"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnv.join(", ")}`);
}

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
initializeSocketService(httpServer);

// TCP
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URL as string, {})
  .then((data) => {
    console.log("MongoDB connection succeed");
    const PORT = process.env.PORT ?? 3003;
    httpServer.listen(PORT, function () {
      console.info(`The server is running successfully on port: ${PORT}`);
      console.info(`Admin project on http://localhost:${PORT}/admin \n`);
    });
  })
  .catch((err) => {
    console.log("ERROR on Connection MOngoDB", err);
  });
