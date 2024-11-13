import express, { Request, Response } from "express";
import { User } from "../models/User";
import { IUser } from "../interfaces/User";

const usersRouter = express.Router();

// Create/register a user
usersRouter.post("/", async (request: Request, response: Response) => {
  try {
    const newUser: IUser = await User.create(request.body);
    response.status(201).json(newUser);
  } catch (err) {
    response.status(400).json({ message: err });
  }
});

// Get all users
usersRouter.get("/", async (_, response: Response) => {
  try {
    const users: Array<IUser> = await User.find();
    response.status(200).json(users);
  } catch (err) {
    response.status(400).json({ message: err });
  }
});

// Get user by userId
usersRouter.get("/:userId", async (request: Request, response: Response) => {
  const { userId } = request.params;
  try {
    const user: IUser | null = await User.findById(userId);
    response.send(user);
  } catch (err) {
    response.status(400).json({ message: err });
  }
});

// Update user by userId
usersRouter.patch("/:userId", async (request: Request, response: Response) => {
  const { userId } = request.params;
  try {
    const user = await User.updateOne({ _id: userId }, { $set: request.body });
    response.status(200).json(user);
  } catch (err) {
    response.status(400).json({ message: err });
  }
});

// Delete a user by userId
usersRouter.delete("/:userId", async (request: Request, response: Response) => {
  const { userId } = request.params;
  try {
    const deletedUser = await User.deleteOne({ _id: userId });
    response.status(200).json(deletedUser);
  } catch (err) {
    response.status(400).json({ message: err });
  }
});

export { usersRouter };
