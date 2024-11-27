import { Model, model, Schema } from "mongoose";
import { genSalt, hash } from "bcryptjs";

import { IUser, IUserDocument } from "../interfaces";

type UserModel = Model<IUser, {}, {}>

export const UserSchema: Schema<IUserDocument, UserModel> = new Schema<IUserDocument, {}>({
  email: {
    type: String,
    unique: true,
    required: true,
    min: 5,
    max: 100
  },
  firstName: {
    type: String,
    required: true,
    min: 5,
    max: 100
  },
  lastName: {
    type: String,
    required: true,
    min: 5,
    max: 100
  },
  password: {
    type: String,
    required: true,
  }
},
{
  timestamps: true // Adds createdAt and modifiedAt fields to Schema
}
);

// Hash passport on pre save of a User object
UserSchema.pre('save', async function() {
  const salt = await genSalt(5);
  const hashedPassword = await hash(this.password, salt);
  this.password = hashedPassword;
});

export const User = model<IUserDocument>("User", UserSchema);
