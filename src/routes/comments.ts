import express, { Request, Response } from "express";
import { Comment } from "../models/Comment";

const commentsRouter = express.Router();

// Get comment by comment id
commentsRouter.get(
  "/:commentId",
  async (request: Request, response: Response) => {
    const { commentId } = request.params;
    try {
      const comment = await Comment.findById(commentId);
      response.status(200).json(comment);
    } catch (err) {
      response.status(500).json({ message: err });
    }
  }
);

// Update comment by comment id
commentsRouter.patch(
  "/:commentId",
  async (request: Request, response: Response) => {
    const { commentId } = request.params;
    try {
      const user = await Comment.findByIdAndUpdate(commentId, {
        $set: request.body,
      });
      response.status(200).json(user);
    } catch (err) {
      response.status(500).json({ message: err });
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
    } catch (err) {
      response.status(500).json({ message: err });
    }
  }
);

export { commentsRouter };
