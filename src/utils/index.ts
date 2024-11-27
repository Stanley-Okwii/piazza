import { Response, Request, NextFunction } from "express";
import { Types } from "mongoose";
import { verify, JwtPayload } from "jsonwebtoken";
import { env } from "node:process";

import { UserJwtPayload, IPostDocument } from "../interfaces";
import { Status } from "./enums";

// Function to check and update `status` on Post documents after a find or findOne query
export const setExpirationStatus = async (post: IPostDocument) => {
  if (post.isExpired() && post.status !== Status.Expired) {
    post.status = Status.Expired;
    await post.save();
  }
};

export const isLikedOrDislikedByUser = (
  userId: string,
  attribute: any
): boolean => {
  // declare a variable and cast ObjectId to strings for easy comparison
  const values: String[] = attribute
    ? attribute.map((id: Types.ObjectId) => String(id))
    : [];
  return values.includes(userId);
};

// Util function to validate request parameters
export const validateRequest = (
  validate: Function,
  requestBody: Object,
  response: Response
): void => {
  const { error } = validate(requestBody);
  if (error) {
    response.status(400).json({ message: error["details"][0]["message"] });
    return;
  }
};

export const verifyAuth = (
  request: Request,
  response: any,
  next: NextFunction
): void => {
  const token: string | undefined = request.header("Auth-Token");
  if (!token) {
    return response.status(401).send({ message: "No token provided" });
  }
  try {
    const payload: JwtPayload | String = verify(token, `${env.TOKEN_SECRET}`);
    const userId: string = (payload as UserJwtPayload)._id;
    response.set("userId", userId); // Set userId to response headers which is later used to identify and logged in user
    next();
  } catch (error) {
    return response.status(401).send({ message: "Invalid token" });
  }
};
