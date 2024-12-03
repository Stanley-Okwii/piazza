import express, { Request, Response } from "express";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { env } from "node:process";

import { User } from "../models";
import { UserLogin } from "../validators";
import { validateRequest } from "../utils";

const authRouter = express.Router();

authRouter.post("/login", async (request: Request, response: Response) => {
  try {
    validateRequest(UserLogin, request.body);
  } catch (error) {
    response.status(500).send({ message: error });
    return;
  }

  const user = await User.findOne({ email: request.body.email });
  if (!user) {
    response.status(400).send({ message: "User does not exist" });
    return;
  }

  const isPasswordCorrect = await compare(request.body.password, user.password);
  if (!isPasswordCorrect) {
    response
      .status(400)
      .send({ message: "Wrong password, check your password and try again" });
    return;
  }

  // Generate auth-token based on user_id
  const token = sign({ _id: user._id }, `${env.TOKEN_SECRET}`, {
    expiresIn: "7d", // Specifies that the token will expire in 7 days
    algorithm: "HS256", // Algorithm used to "sign" or encode the values of the JWT
  });
  response.header("auth-token", token).send({ "auth-token": token });
});

export { authRouter };
