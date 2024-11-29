import express, { Request, Response } from "express";

import { User } from "../models";
import { IUser } from "../interfaces";
import { User as UserValidator, UserID } from "../validators";
import { validateRequest, verifyAuth } from "../utils";

const usersRouter = express.Router();

// Create/register a user
usersRouter.post("/", async (request: Request, response: Response) => {
  try {
    validateRequest(UserValidator, request.body);
    const newUser: IUser = await User.create(request.body);
    response.status(201).json(newUser);
  } catch (error) {
    response.status(400).json({ message: error });
  }
});

// Get all users
usersRouter.get("/", verifyAuth, async (_, response: Response) => {
  try {
    const users: Array<IUser> = await User.find();
    response.status(200).json(users);
  } catch (err) {
    response.status(400).json({ message: err });
  }
});

// Get user by userId
usersRouter.get(
  "/:userId",
  verifyAuth,
  async (request: Request, response: Response) => {
    const { userId } = request.params;

    try {
      validateRequest(UserID, request.params);
      const user: IUser | null = await User.findById(userId);
      response.status(200).json(user);
    } catch (err) {
      response.status(400).json({ message: err });
    }
  }
);

// Update user by userId
usersRouter.patch(
  "/:userId",
  verifyAuth,
  async (request: Request, response: Response) => {
    const { userId } = request.params;

    try {
      validateRequest(UserID, request.params);
      const user = await User.findByIdAndUpdate(userId, { $set: request.body });
      response.status(200).json(user);
    } catch (err) {
      response.status(400).json({ message: err });
    }
  }
);

// Delete a user by userId
usersRouter.delete(
  "/:userId",
  verifyAuth,
  async (request: Request, response: Response) => {
    const { userId } = request.params;

    try {
      validateRequest(UserID, request.params);
      const deletedUser = await User.findByIdAndDelete(userId);
      response.status(200).json(deletedUser);
    } catch (err) {
      response.status(400).json({ message: err });
    }
  }
);

export { usersRouter };
