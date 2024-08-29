import { Request, Response, NextFunction } from "express";
import {
  createSignedToken,
  getUserByEmailOrUsername,
  getUserById,
  hashPassword,
  ServerError,
  updateUser,
} from "../utils";
import {
  signInUserSchema,
  signUpUserSchema,
  resetPasswordSchema,
  resetPassWordWithPassword,
} from "../types";
import {
  signUpUserSchema as signupValidator,
  signInUserSchema as signInValidator,
  resetPasswordSchema as resetPasswordValidator,
  resetPassWordWithPassword as passwordResetValidator,
} from "../validators";
import { createNewUser, signInUser } from "../utils";
import { NodeMailer } from "../utils";
import { REFRESH_TOKEN_NAME } from "../utils/constant";

type UIDObject = { userId: string };
export interface CustomRequest<T = {}> extends Request {
  user?: UIDObject;
  body: T;
}

async function handleSignUpUserRoute(
  req: Request<{}, {}, signUpUserSchema>,
  res: Response,
  next: NextFunction
) {
  await signupValidator.validateAsync(req.body);
  // create a new user
  const { user } = await createNewUser(req.body);
  res.status(201).send({
    user,
    success: true,
    message: "user created successfully",
  });
}

// handle get request for the blog-post route
async function handleSignInRoute(
  req: Request<{}, {}, signInUserSchema>,
  res: Response
) {
  await signInValidator.validateAsync(req.body);
  // sign user in
  const { token, user, refreshToken } = await signInUser(req.body);
  res.cookie("__refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  res
    .status(201)
    .send({ user, token, success: true, message: "successfully signed in" });
}

// handle password reset email, unprotected route
async function resetPasswordRoute(
  req: CustomRequest<resetPasswordSchema>,
  res: Response,
  next: NextFunction
) {
  let userId;
  let userName;
  let userEmail;
  if (!req.body) throw new ServerError("Request body required", 400);
  // verify body schema
  await resetPasswordValidator.validateAsync(req.body);
  // if not signed in user
  if (!req.user) {
    // get user with email
    const { username, email, _id } = await getUserByEmailOrUsername(req.body);
    userId = _id as string;
    userName = username;
    userEmail = email;
  } else {
    // get loggedIn user
    const loggedInUser = await getUserById(req.user.userId);
    // check if reset is for user
    if (
      loggedInUser.email !== req.body.email ||
      loggedInUser.username !== req.body.username
    ) {
      throw new ServerError("Unauthorized", 403);
    }
    userId = loggedInUser._id as string;
    userName = loggedInUser.username;
    userEmail = loggedInUser.email;
  }

  await NodeMailer.sendResetLink(
    {
      email: userEmail,
      userId,
      userName,
    },
    "reset_password_email"
  );
  res.send({
    success: true,
    message: "reset link sent successfully",
  });
}

async function resetPasswordFormRoute(req: CustomRequest, res: Response) {
  const { user } = req;
  if (!user) throw new ServerError("Unauthorized", 401);

  const { token } = req.params;
  const csrfToken = req.csrfToken(); // Generate CSRF token

  // Check if the request accepts HTML
  if (req.accepts("html")) {
    res.render("reset_password", { token, csrfToken });
  } else {
    res.json({
      success: true,
      message: "CSRF token generated",
      token,
      csrfToken: csrfToken,
    });
  }
}
async function handlePasswordRoute(
  req: CustomRequest<resetPassWordWithPassword>,
  res: Response
) {
  const { user } = req;
  if (!user) throw new ServerError("Unauthorized", 401);
  await passwordResetValidator.validateAsync(req.body);
  // Hash the new password
  const hashedPassword = await hashPassword(req.body.password);
  await updateUser(user.userId, { password: hashedPassword });

  res.json({ success: true, message: "Password has been reset successfully." });
}

async function handleRefreshTokenRoute(req: CustomRequest, res: Response) {
  const { user } = req;
  try {
    await getUserById(user?.userId ?? null);
  } catch (err) {
    throw new ServerError("Forbidden", 403);
  }
  const token = createSignedToken({ userId: user?.userId });
  res
    .status(200)
    .send({ success: true, message: "Token refreshed successfully", token });
}

async function handleSignOut(req: Request, res: Response) {
  const refreshToken = req.cookies[REFRESH_TOKEN_NAME]; // Get the refresh token from the HTTP-only cookie

  if (!refreshToken) {
    res.status(400).json({ success: false, error: "No refresh token found!" });
    return;
  }
  res.clearCookie(REFRESH_TOKEN_NAME, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
}
export {
  handleSignUpUserRoute,
  handleSignInRoute,
  resetPasswordRoute,
  resetPasswordFormRoute,
  handlePasswordRoute,
  handleRefreshTokenRoute,
  handleSignOut,
};
