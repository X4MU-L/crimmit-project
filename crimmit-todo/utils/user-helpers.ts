import { User, IUserType } from "../models";
import { ServerError } from "./server-error";

async function getUserById(userId: string | null): Promise<IUserType> {
  const user = await User.findById(userId);
  if (!user) {
    throw new ServerError("User not found", 404);
  }
  return user.toObject();
}
