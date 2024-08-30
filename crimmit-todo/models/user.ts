import mongoose, {
  Schema,
  Document,
  createConnection,
  Connection,
} from "mongoose";

// Ensure dotenv config is called before any other imports
import dotenv from "dotenv";
import { required } from "joi";
dotenv.config();
const authConnection = createConnection(process.env.MONGODB_URL!, {
  dbName: "auth",
});

export interface IUserType extends Document {
  username: string;
  email: string;
  password: string;
  updatedAt: Date;
  createdAt: Date;
}

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
});

const User = authConnection.model<IUserType>("User", userSchema);

export const connectAuthDB = (): Promise<Connection> => {
  return new Promise((resolve, reject) => {
    authConnection.once("open", () => resolve(authConnection));
    authConnection.on("error", (err) => reject(err));
  });
};
export default User;
