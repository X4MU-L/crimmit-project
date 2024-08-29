import dotenv from "dotenv";
import express from "express";
import bodyParser = require("body-parser");
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import { MongoConnect } from "./database";
import { ServerError, globalErrorHandler } from "./utils";
import authRoute from "./routes/auth";
import csrf from "csurf";
import path = require("path");
// load environment variables
dotenv.config();

// create express app
const app = express();
const PORT = process.env.PORT || 5009;
const csrfProtection = csrf({ cookie: true });

const allowedOrigins = ["http://localhost:5009"];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
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
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(csrfProtection);

// routes

app.use("/api/v1/auth", authRoute);
// generate csrf token for mutating requests
app.get("/api/v1/csrf-token", (req, res) => {
  const csrfToken = req.csrfToken(); // Generate CSRF token
  res.json({ csrfToken }); // Return token in JSON format
});
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
