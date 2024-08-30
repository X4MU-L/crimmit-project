import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import todoRoutes from "./routes";

dotenv.config();

const app = express();

import { connectAuthDB } from "./models/user";
import { connectTodoDB } from "./models/todo";
import { globalErrorHandler, ServerError } from "./utils";

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1", todoRoutes);

// handle 404
app.all("*", (req, res, next) => {
  next(
    new ServerError(`This path ${req.originalUrl} isn't on this server!`, 404)
  );
});

// global error handler
app.use(globalErrorHandler);

// Ensure dotenv config is called before any other imports
// Ensure both connections are established before starting the server
Promise.all([connectAuthDB(), connectTodoDB()])
  .then(() => {
    console.log("Both databases are connected successfully");

    // Start the server
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to databases", err);
    process.exit(1); // Exit the process if connections fail
  });
