import { Document, Types } from "mongoose";


export interface IPost {
  author: Types.ObjectId;
  title: string;
  content: string;
  topics: Array<{ name: string }>;
  status: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  likes: Array<Types.ObjectId>;
  dislikes: Array<Types.ObjectId>;
  comments: Array<Types.ObjectId>;
  reactionsCount: number; // Tracks the sum number of likes and dislikes and is used to compute the active post
};

export interface IPostMethods {
  isExpired(): Function;
  isLikedByUser(userId: string): Function;
  isDislikedByUser(userId: string): Function;
};

// Extend
export interface IPostDocument extends IPost, Document, IPostMethods {};
