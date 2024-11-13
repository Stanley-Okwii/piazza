import { Document } from "mongoose";

export interface IUser {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  createdAt: Date;
}

export interface IUserDocument extends IUser, Document {}
