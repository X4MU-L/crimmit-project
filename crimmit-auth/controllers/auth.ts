import { Request, Response } from "express";
import { ServerError } from "../utils";
import { signInUserSchema, signUpUserSchema } from "../types";
import { signUpUserSchema as signupValidator } from "../validators";
import { createNewUser } from "../utils";
import { ValidationError } from "joi";

async function handleSignUpUserRoute(
  req: Request<{}, {}, signUpUserSchema>,
  res: Response
) {
  try {
    await signupValidator.validateAsync(req.body);
  } catch (error: unknown) {
    throw new ServerError((error as ValidationError).message, 400);
  }
  // create a new user
  const { user } = await createNewUser(req.body);
  res.status(201).send({
    user,
    success: true,
    message: "user created successfully",
  });
}

export { handleSignUpUserRoute };
