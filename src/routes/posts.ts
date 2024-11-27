import express, { Router, Request, Response } from "express";

import { Post, Comment } from "../models";
import { IPostDocument } from "../interfaces";
import { Post as PostValidator, PostID, Comment as CommentValidator } from "../validators";
import { validateRequest,  verifyAuth } from "../utils";


const postsRouter: Router = express.Router();

// Create a single post
postsRouter.post("/",  verifyAuth, async (request: Request, response: Response) => {
  validateRequest(PostValidator, request.body, response);
  const userId = (request as any).user._id;
  const { expiresIn } = request.body;

  try {
    // Calculate the expiration date
    const expiresAt = new Date(Date.now() + expiresIn * 60 * 1000);
    const newPost = await Post.create({
      author: userId,
      expiresAt,
      ...request.body,
    });
    response.status(201).json(newPost);
  } catch (err) {
    response.status(500).json({ message: err });
  }
});

// Get all posts
postsRouter.get("/", verifyAuth,  async (request: Request, response: Response) => {
  // TODO: add query param validator
  const { topic, expired, active } = request.query;
  try {
    let filters = {};
    if (topic && typeof topic === "string") {
      // Assume: Only one topics posts can seen at time..
      filters = { topics: [topic] };
    }
    if (expired && typeof expired === "string") {
      // Assume: Only one topics posts can seen at time..
      const currentTime = new Date();
      if (expired === "true") {
        filters = { expiresAt: { $lt: currentTime }, ...filters };
      } else {
        filters = { expiresAt: { $gt: currentTime }, ...filters };
      }
    }
    if (active && typeof active === "string") {
      // Assume: Only one topics posts can seen at time..
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
  } catch (error) {
    response.send({ message: error });
  }
});

// Get post by postId,
postsRouter.get("/:postId", verifyAuth,  async (request: Request, response: Response) => {
  validateRequest(PostID, request.params, response);

  const { postId } = request.params;
  try {
    const post: IPostDocument | null = await Post.findById(postId)
      .populate("author", "email firstName lastName")
      .populate("comments", "content");
    response.status(200).json(post);
  } catch (error) {
    response.send({ message: error });
  }
});

// Update post by postId
postsRouter.patch("/:postId", verifyAuth,  async (request: Request, response: Response) => {
  validateRequest(PostID, request.params, response);
  const { postId } = request.params;
  const { body } = request;

  try {
    const post: IPostDocument | null = await Post.findByIdAndUpdate(postId, {
      $set: {
        ...body,
      },
    });
    response.send(post);
  } catch (err) {
    response.send({ message: err });
  }
});

// Delete a post by postId
postsRouter.delete("/:postId", verifyAuth,  async (request: Request, response: Response) => {
  validateRequest(PostID, request.params, response);
  const { postId } = request.params;
  try {
    const postToDelete: IPostDocument | null = await Post.findByIdAndDelete(
      postId
    );
    response.send(postToDelete);
  } catch (err) {
    response.send({ message: err });
  }
});

// Like a post
postsRouter.post(
  "/:postId/like", verifyAuth,
  async (request: Request, response: Response) => {
    validateRequest(PostID, request.params, response);
    const userId: string = response.getHeader('userId') as string; // Cast userId to string since we expect a string back
    const { postId } = request.params;

    try {
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

// Dislike a post
postsRouter.post(
  "/:postId/dislike", verifyAuth, 
  async (request: Request, response: Response) => {
    validateRequest(PostID, request.params, response);
    const userId: string = response.getHeader('userId') as string; // Cast userId to string since we expect a string back
    const { postId } = request.params;

    try {
      const post = await Post.findById(postId);
      if (post) {
        if (post.isExpired()) {
          response
            .status(400)
            .json({ message: "You can not dislike an expired post" });
        }
        if (String(post?.author) === userId) {
          response
            .status(400)
            .json({ message: "You can not dislike your own post" });
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
        }
      }
    } catch (error) {
      response.send({ message: error });
    }
  }
);

// Comment on a post
postsRouter.post(
  "/:postId/comment", verifyAuth, 
  async (request: Request, response: Response) => {
    validateRequest(PostID, request.params, response);
    validateRequest(CommentValidator, request.body, response);
    const userId: string = response.getHeader('userId') as string; // Cast userId to string since we expect a string back
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
    } catch (err) {
      response.send({ message: err });
    }
  }
);

export { postsRouter };
