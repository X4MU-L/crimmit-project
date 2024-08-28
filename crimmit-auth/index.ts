import dotenv from "dotenv";
import express from "express";
import bodyParser = require("body-parser");
import cors, { CorsOptions } from "cors";
import { MongoConnect } from "./database";

// load environment variables
dotenv.config();

// create express app
const app = express();
const PORT = process.env.PORT || 5009;

const allowedOrigins = [
  "http://localhost:3000", // for development
];

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

app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: true,
    message: "Welcome to crimmit auth server",
  });
});

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
