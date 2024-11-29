import express, { Router, Request, Response } from "express";

import { Post, Comment } from "../models";
import { IPostDocument } from "../interfaces";
import {
  Post as PostValidator,
  PostID,
  PostSearchParams,
  Comment as CommentValidator,
} from "../validators";
import { validateRequest, verifyAuth } from "../utils";

const postsRouter: Router = express.Router();

// Create a single post
postsRouter.post(
  "/",
  verifyAuth,
  async (request: Request, response: Response) => {
    try {
      validateRequest(PostValidator, request.body);
      const userId: string = request.headers["user-id"] as string; // Cast userId to string since we expect a string
      const { expiresIn } = request.body;
      // Calculate the expiration date based on expiresIn value
      const expiresAt = new Date(Date.now() + expiresIn * 60 * 1000);
      const newPost = await Post.create({
        author: userId,
        expiresAt,
        ...request.body,
      });

      response.status(201).json(newPost);
    } catch (error) {
      response.status(500).json({ message: error });
    }
  }
);

// Get all posts
postsRouter.get(
  "/",
  verifyAuth,
  async (request: Request, response: Response) => {
    const { topic, expired, active } = request.query;
    let filters = {};

    try {
      validateRequest(PostSearchParams, request.query);
      if (topic) {
        // Assumption: A user can only search for a single post of a single topic at a time
        filters = { topics: [topic] };
      }

      if (expired) {
        // Assumption: Only one topics posts can seen at time..
        const currentTime = new Date();
        if (expired === "true") {
          filters = { expiresAt: { $lt: currentTime }, ...filters };
        } else {
          filters = { expiresAt: { $gt: currentTime }, ...filters };
        }
      }

      if (active) {
        // Assumption: Active filter can not be used with expired filter
        const currentTime = new Date();
        filters = { expiresAt: { $gt: currentTime }, ...filters };
        const posts = await Post.find(filters)
          .populate("author", "email firstName lastName")
          .populate("comments", "content")
          .sort({ reactionsCount: -1 })
          .limit(1);
        response.status(200).json(posts);
        return;
      }

      const allPosts = await Post.find(filters)
        .populate("author", "email firstName lastName")
        .populate("comments", "content");
      response.status(200).json(allPosts);
      return;
    } catch (error) {
      response.status(500).json({ message: error });
    }
  }
);

// Get a single post by a postId,
postsRouter.get(
  "/:postId",
  verifyAuth,
  async (request: Request, response: Response) => {
    const { postId } = request.params;

    try {
      validateRequest(PostID, request.params);
      const post: IPostDocument | null = await Post.findById(postId)
        .populate("author", "email firstName lastName")
        .populate("comments", "content");
      response.status(200).json(post);
    } catch (error) {
      response.status(500).json({ message: error });
    }
  }
);

// Update a single post by a postId
postsRouter.patch(
  "/:postId",
  verifyAuth,
  async (request: Request, response: Response) => {
    const { postId } = request.params;
    const { body } = request;

    try {
      validateRequest(PostID, request.params);
      const post: IPostDocument | null = await Post.findByIdAndUpdate(postId, {
        $set: {
          ...body,
        },
      });
      response.send(post);
    } catch (error) {
      response.send({ message: error });
    }
  }
);

// Delete a single post by a postId
postsRouter.delete(
  "/:postId",
  verifyAuth,
  async (request: Request, response: Response) => {
    const { postId } = request.params;

    try {
      validateRequest(PostID, request.params);
      const postToDelete: IPostDocument | null = await Post.findByIdAndDelete(
        postId
      );
      response.send(postToDelete);
    } catch (error) {
      response.send({ message: error });
    }
  }
);

// Like a single post by a postId
postsRouter.post(
  "/:postId/like",
  verifyAuth,
  async (request: Request, response: Response) => {
    const userId: string = request.headers["user-id"] as string; // Cast userId to string since we expect a string
    const { postId } = request.params;

    try {
      validateRequest(PostID, request.params);
      const post = await Post.findById(postId);
      if (post) {
        if (post.isExpired()) {
          response
            .status(400)
            .json({ message: "You can not like an expired post" });
          return;
        }
        if (String(post?.author) === userId) {
          response
            .status(400)
            .json({ message: "You can not like your own post" });
          return;
        }
        if (post.isLikedByUser(userId)) {
          response
            .status(400)
            .json({ message: "You have already liked this Post" });
        } else {
          if (post.isDislikedByUser(userId)) {
            await Post.findByIdAndUpdate(postId, {
              $pull: { dislikes: userId },
            });
          }
          await Post.findByIdAndUpdate(postId, {
            $addToSet: { likes: userId },
          });
          response.status(200).json({ message: "Successfully liked post" });
        }
      }
    } catch (error) {
      response.send({ message: error });
    }
  }
);

// Dislike a single post by postId
postsRouter.post(
  "/:postId/dislike",
  verifyAuth,
  async (request: Request, response: Response) => {
    const userId: string = request.headers["user-id"] as string; // Cast userId to string since we expect a string
    const { postId } = request.params;

    try {
      validateRequest(PostID, request.params);
      const post = await Post.findById(postId);
      if (post) {
        if (post.isExpired()) {
          response
            .status(400)
            .json({ message: "You can not dislike an expired post" });
          return;
        }
        if (String(post?.author) === userId) {
          response
            .status(400)
            .json({ message: "You can not dislike your own post" });
          return;
        }
        if (post.isDislikedByUser(userId)) {
          response
            .status(400)
            .json({ message: "You have already disliked this Post" });
        } else {
          if (post.isLikedByUser(userId)) {
            await Post.findByIdAndUpdate(postId, {
              $pull: { likes: userId },
            });
          }
          await Post.findByIdAndUpdate(postId, {
            $addToSet: { dislikes: userId },
          });

          response.status(200).json({ message: "Successfully disliked post" });
          return;
        }
      }
    } catch (error) {
      response.status(500).send({ message: error });
      return;
    }
  }
);

// Add a comment on a post
postsRouter.post(
  "/:postId/comment",
  verifyAuth,
  async (request: Request, response: Response) => {
    try {
      validateRequest(PostID, request.params);
      validateRequest(CommentValidator, request.body);
    } catch (error) {
      response.status(500).send({ message: error });
      return;
    }
    const userId: string = request.headers["user-id"] as string; // Cast userId to string since we expect a string
    const { postId } = request.params;
    const { content } = request.body;
    const post = await Post.findById(postId);

    if (!post) {
      response
        .status(400)
        .json({ message: `Post with id: ${postId} was not found` });
      return;
    }
    if (post.isExpired()) {
      response
        .status(400)
        .json({ message: "You can not comment on an expired post" });
      return;
    }

    try {
      const comment = await Comment.create({
        author: userId,
        content,
      });
      await Post.findByIdAndUpdate(postId, {
        $addToSet: { comments: comment.id },
      });
      response.status(201).json(comment);
      return;
    } catch (error) {
      response.status(500).send({ message: error });
      return;
    }
  }
);

export { postsRouter };
