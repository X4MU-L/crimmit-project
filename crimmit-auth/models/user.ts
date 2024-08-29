import { Document, Model, model, Schema } from "mongoose";

export interface UserType extends Document {
  username: string;
  email: string;
  password: string;
  updatedAt: Date;
  createdAt: Date;
}

export type UserTypeWithoutPassword = Omit<UserType, "password">;

export const UserSchema = new Schema<UserType>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User: Model<UserType> = model<UserType>("User", UserSchema);

export default User;
