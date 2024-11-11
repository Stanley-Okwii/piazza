import { Document, ObjectId } from "mongoose";

export interface IComment {
  author: ObjectId;
  content: string;
}

export interface ICommentDocument extends IComment, Document {}
