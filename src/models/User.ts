import { Model, model, Schema } from "mongoose";
import { IUser, IUserDocument } from "../interfaces/User";

type UserModel = Model<IUser, {}, {}>

export const UserSchema: Schema<IUserDocument, UserModel> = new Schema<IUserDocument, {}>({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash passport on pre save
UserSchema.pre('save', function(): void {
    console.log(this.firstName); // TypeScript knows that `this` is a `mongoose.Document & User` by default
});

export const User = model<IUserDocument>("User", UserSchema);
