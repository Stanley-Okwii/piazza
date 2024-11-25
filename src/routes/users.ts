import express, { Request, Response } from "express";
import { User } from "../models/User";
import { IUser } from "../interfaces/User";
import { validateUser, validateUserID } from "../validators";

const usersRouter = express.Router();

// Create/register a user
usersRouter.post("/", async (request: Request, response: Response) => {
  const { error } = validateUser(request.body);
  if (error) {
    response.status(400).json({ message: error["details"][0]["message"] });
    return;
  }

  try {
    const newUser: IUser = await User.create(request.body);
    response.status(201).json(newUser);
  } catch (error) {
    response.status(400).json({ message: error });
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
  const { error } = validateUserID(request.params);
  if (error) {
    response.status(400).json({ message: error["details"][0]["message"] });
    return;
  }
  try {
    const user: IUser | null = await User.findById(userId);
    response.status(200).json(user);
  } catch (err) {
    response.status(400).json({ message: err });
  }
});

// Update user by userId
usersRouter.patch("/:userId", async (request: Request, response: Response) => {
  const { userId } = request.params;
  const { error } = validateUserID(request.params);
  if (error) {
    response.status(400).json({ message: error["details"][0]["message"] });
    return;
  }
  try {
    const user = await User.findByIdAndUpdate(userId, { $set: request.body });
    response.status(200).json(user);
  } catch (err) {
    response.status(400).json({ message: err });
  }
});

// Delete a user by userId
usersRouter.delete("/:userId", async (request: Request, response: Response) => {
  const { userId } = request.params;
  const { error } = validateUserID(request.params);
  if (error) {
    response.status(400).json({ message: error["details"][0]["message"] });
    return;
  }
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    response.status(200).json(deletedUser);
  } catch (err) {
    response.status(400).json({ message: err });
  }
});

export { usersRouter };
