import express from "express";
import { asyncHandler, customAsyncHandler } from "../utils";
import { authHandler } from "../middleware";

const router = express.Router();

export interface resetPasswordSchema {
  email?: string;
  username?: string;
}
import {
  handleSignUpUserRoute,
  handleSignInRoute,
  resetPasswordRoute,
  resetPasswordFormRoute,
  handlePasswordRoute,
  handleRefreshTokenRoute,
  handleSignOut,
  verifyToken
} from "../controllers";

router.post("/signup", asyncHandler(handleSignUpUserRoute));
router.post("/signin", asyncHandler(handleSignInRoute));
router.post("/signout", asyncHandler(handleSignOut));
router.post(
  "/reset-password",
  customAsyncHandler(authHandler),
  customAsyncHandler(resetPasswordRoute)
);
router.post(
  "/verify-token",
  customAsyncHandler(authHandler),
  customAsyncHandler(verifyToken)
);
router
  .route("/reset-password/:token")
  .get(
    customAsyncHandler(authHandler),
    customAsyncHandler(resetPasswordFormRoute)
  )
  .post(
    customAsyncHandler(authHandler),
    customAsyncHandler(handlePasswordRoute)
  );

router
  .route("/refresh-token")
  .get(
    customAsyncHandler(authHandler),
    customAsyncHandler(handleRefreshTokenRoute)
  )
  .post(
    customAsyncHandler(authHandler),
    customAsyncHandler(handleRefreshTokenRoute)
  );
export default router;
