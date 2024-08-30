import { Router } from "express";
import { handleSignUp, handleSignIn } from "../controllers";
import { asyncHandler } from "../utils";

const router = Router();

router.post("/signup", asyncHandler(handleSignUp));
router.post("/signin", asyncHandler(handleSignIn));

export default router;
