import express from "express";

const router = express.Router();

import { handleSignUpUserRoute } from "../controllers";

router.post("/signup", handleSignUpUserRoute);

export default router;
