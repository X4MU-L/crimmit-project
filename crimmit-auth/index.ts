import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import bodyParser = require("body-parser");
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import { MongoConnect } from "./database";
import { ServerError, globalErrorHandler } from "./utils";
import authRoute from "./routes/auth";

import path = require("path");
// load environment variables
dotenv.config();

// create express app
const app = express();
const PORT = process.env.PORT || 5009;

const allowedOrigins = ["http://localhost:5009"];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    console.log("origin", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "HEAD,POST",
  optionsSuccessStatus: 200,
};

// template engine middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public/views"));
app.use(express.static("public"));

// middlewares
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET!, // Your secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" }, // Use secure cookies in production
  })
);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes

app.use("/api/v1/auth", authRoute);
// check app health
app.get("/health", (req, res) => {
  res.status(200).json({
    status: true,
    message: "Welcome to crimmit auth server",
  });
});

// handle 404
app.all("*", (req, res, next) => {
  next(
    new ServerError(`This path ${req.originalUrl} isn't on this server!`, 404)
  );
});

// global error handler
app.use(globalErrorHandler);
// start server
(async () => {
  try {
    await MongoConnect();
    app.listen(+PORT, async () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start app", error);
    process.exit(1);
  }
})();
