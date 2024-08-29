import _ from "lodash";
import { MongoServerError } from "mongodb";
import { MongooseError, Error as Mo } from "mongoose";
import {
  User,
  UserType,
  UserTypeWithoutPassword,
  SignInUserType,
} from "../models";
import { signUpUserSchema, signInUserSchema } from "../types";
import { hashPassword, verifyPassword, createTokens } from "./helper";
import { ServerError } from "./server-error";

async function createNewUser(
  data: signUpUserSchema
): Promise<{ user: UserTypeWithoutPassword }> {
  const password = await hashPassword(data.password);
  const updateDetails = { ...data, password };
  const newUser = new User(updateDetails);
  try {
    const user = await newUser.save();
    const userObject = user.toObject();
    return { user: _.omit(userObject, ["password"]) };
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      const field = Object.keys(error.errorResponse.keyPattern)[0];
      if (field === "email") {
        throw new ServerError("Email already exists", 409);
      } else if (field === "username") {
        throw new ServerError("Username already exists", 409);
      }
    }
    throw error;
  }
}

async function signInUser(data: signInUserSchema): Promise<SignInUserType> {
  const { email, password } = data;
  const user = await getUserByEmailOrUsername(data);
  // verify password
  const match = await verifyPassword(password, user.password);
  if (!match) {
    throw new ServerError(
      `Invalid ${email ? "email" : "username"} or password`,
      401
    );
  }
  const tokens = createTokens({ userId: user._id });

  return {
    user: _.omit(user, ["password"]),
    ...tokens,
  };
}

async function getUserByEmailOrUsername(data: {
  email?: string;
  username?: string;
}): Promise<UserType> {
  const queryInfo = data.email
    ? { email: data.email }
    : { username: data.username };
  const user = await User.findOne(queryInfo);
  if (!user) {
    throw new ServerError("User not found", 404);
  }
  return user.toObject();
}
async function getUserById(userId: string | null): Promise<UserType> {
  const user = await User.findById(userId);
  if (!user) {
    throw new ServerError("User not found", 404);
  }
  return user.toObject();
}

async function updateUser(userId: string, data: Record<string, any>) {
  await User.updateOne({ _id: userId }, data);
}
export {
  createNewUser,
  signInUser,
  getUserByEmailOrUsername,
  getUserById,
  updateUser,
};
