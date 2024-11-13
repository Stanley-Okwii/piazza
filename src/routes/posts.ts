import express, { Router, Request, Response } from "express";

import { Post } from "../models/Post";
import { Comment } from "../models/Comment";

const postsRouter: Router = express.Router();

// Create a single post
postsRouter.post("/", async (request: Request, response: Response) => {
  const { expiresIn } = request.body;
  const userId = "672fabc8307ab120110a5b47";
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
    response.send({ message: err });
  }
});

// Get all posts
postsRouter.get("/", async (request: Request, response: Response) => {
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
      const allPosts = await Post.find(filters)
        .populate("author", "email firstName lastName")
        .populate("comments", "content")
        .sort({ reactionCount: -1 })
        .limit(1);
      response.status(200).json(allPosts);
      return;
    }
    const allPosts = await Post.find(filters)
      .populate("author", "email firstName lastName")
      .populate("comments", "content");
    response.status(200).json(allPosts);
  } catch (err) {
    response.send({ message: err });
  }
});

// Get post by postId,
postsRouter.get("/:postId", async (request: Request, response: Response) => {
  const { postId } = request.params;
  try {
    const getPostById = await Post.findById(postId)
      .populate("author", "email firstName lastName")
      .populate("comments", "content");
    response.status(200).json(getPostById);
  } catch (err) {
    response.send({ message: err });
  }
});

// Update post by postId
postsRouter.patch("/:postId", async (request: Request, response: Response) => {
  const { postId } = request.params;
  try {
    const updatePostById = await Post.findByIdAndUpdate(postId, {
      $set: {
        author: request.body.user,
        title: request.body.title,
        text: request.body.text,
        hashtag: request.body.hashtag,
        location: request.body.location,
        url: request.body.url,
      },
    });
    response.send(updatePostById);
  } catch (err) {
    response.send({ message: err });
  }
});

// Delete a post by postId
postsRouter.delete("/:postId", async (request: Request, response: Response) => {
  const { postId } = request.params;
  try {
    const postToDelete = await Post.deleteOne({ _id: postId });
    response.send(postToDelete);
  } catch (err) {
    response.send({ message: err });
  }
});

// Like a post
postsRouter.post(
  "/:postId/like",
  async (request: Request, response: Response) => {
    const userId = "672fe3c225e13979680b0fea";
    const { postId } = request.params;
    try {
      const post = await Post.findById({ _id: postId });
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
    } catch (err) {
      response.send({ message: err });
    }
  }
);

// Dislike a post
postsRouter.post(
  "/:postId/dislike",
  async (request: Request, response: Response) => {
    const { postId } = request.params;
    const userId = "672fe3c225e13979680b0fea";
    try {
      const post = await Post.findById({ _id: postId });
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
            await Post.findByIdAndUpdate(request.params.postId, {
              $pull: { likes: userId },
            });
          }
          await Post.findByIdAndUpdate(request.params.postId, {
            $addToSet: { dislikes: userId },
          });

          // TODO:  Remove like is a user has disliked as post that they previous liked...
          response.status(200).json({ message: "Successfully disliked post" });
        }
      }
    } catch (err) {
      response.send({ message: err });
    }
  }
);

// Comment on a post
postsRouter.post(
  "/:postId/comment",
  async (request: Request, response: Response) => {
    const userId = "672fe3c225e13979680b0fea";
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
