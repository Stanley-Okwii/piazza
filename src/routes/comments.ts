import express, { Request, Response } from "express";

import { Comment } from "../models";
import { CommentID } from "../validators";
import { validateRequest, verifyAuth } from "../utils";

const commentsRouter = express.Router();

// Get a single comment by commentId
commentsRouter.get(
  "/:commentId",
  verifyAuth,
  async (request: Request, response: Response) => {
    const { commentId } = request.params;

    try {
      validateRequest(CommentID, request.params);
      const comment = await Comment.findById(commentId);
      response.status(200).json(comment);
    } catch (error) {
      response.status(500).json({ message: error });
    }
  }
);

// Update a single comment by commentId
commentsRouter.patch(
  "/:commentId",
  verifyAuth,
  async (request: Request, response: Response) => {
    const { commentId } = request.params;

    try {
      validateRequest(CommentID, request.params);
      const user = await Comment.findByIdAndUpdate(commentId, {
        $set: request.body,
      });
      response.status(200).json(user);
    } catch (error) {
      response.status(500).json({ message: error });
    }
  }
);

// Delete a comment by commentId
commentsRouter.delete(
  "/:commentId",
  verifyAuth,
  async (request: Request, response: Response) => {
    const { commentId } = request.params;

    try {
      validateRequest(CommentID, request.params);
      const deletedComment = await Comment.findByIdAndDelete(commentId);
      response.status(200).json(deletedComment);
    } catch (error) {
      response.status(500).json({ message: error });
    }
  }
);

export { commentsRouter };
