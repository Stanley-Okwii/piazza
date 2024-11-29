import { JwtPayload } from "jsonwebtoken";

export * from "./Comment";
export * from "./User";
export * from "./Post";

export interface UserJwtPayload extends JwtPayload {
  _id: string;
}

export interface IUserID {
  userId: string;
}

export interface IPostID {
  postId: string;
}

export interface ICommentID {
  commentId: string;
}
