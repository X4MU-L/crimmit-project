import _ from "lodash";
import { MongoError } from "mongodb";
import { MongooseError, Error as Mo } from "mongoose";
import { User, UserType, UserTypeWithoutPassword } from "../models";
import { signUpUserSchema } from "../types";
// import ServerError from "./server-error";
import { hashPassword } from "./helper";

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
    if (error instanceof MongoError && error.code === 11000) {
      console.log(error);
    }
    throw error; // Re-throw any other error
  }
}

export { createNewUser };
