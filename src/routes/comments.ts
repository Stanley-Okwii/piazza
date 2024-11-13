import express, { Request, Response } from "express";
import { Comment } from "../models/Comment";

const commentsRouter = express.Router();

// Get comment by commentId
commentsRouter.get(
  "/:commentId",
  async (request: Request, response: Response) => {
    const { commentId } = request.params;
    try {
      const comment = await Comment.findById(commentId);
      response.status(200).json(comment);
    } catch (error) {
      response.status(500).json({ message: error });
    }
  }
);

// Update comment by commentId
commentsRouter.patch(
  "/:commentId",
  async (request: Request, response: Response) => {
    const { commentId } = request.params;
    try {
      const user = await Comment.findByIdAndUpdate(commentId, {
        $set: request.body,
      });
      response.status(200).json(user);
    } catch (error) {
      response.status(500).json({ message: error });
    }
  }
);

// Delete a comment by id
commentsRouter.delete(
  "/:commentId",
  async (request: Request, response: Response) => {
    const { commentId } = request.params;
    try {
      const deletedComment = await Comment.findByIdAndDelete(commentId);
      response.status(200).json(deletedComment);
    } catch (error) {
      response.status(500).json({ message: error });
    }
  }
);

export { commentsRouter };
