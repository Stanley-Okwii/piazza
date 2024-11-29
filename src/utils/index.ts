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
  requestBody: Object
) => {
  const { error } = validate(requestBody);
  if (error) {
    throw error["details"][0]["message"];
  }
};

export const verifyAuth = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const token: string | undefined = request.header("auth-token");
  if (!token) {
    response.status(401).send({ message: "No token provided" });
    return;
  }
  try {
    const payload: JwtPayload | String = verify(token, `${env.TOKEN_SECRET}`);
    const userId: string = (payload as UserJwtPayload)._id;
    // Set user-id to request headers which is later used to identify a logged in user
    request.headers["user-id"] = userId;
    next();
  } catch (error) {
    response.status(401).json({ message: "Invalid token" });
    return;
  }
};
