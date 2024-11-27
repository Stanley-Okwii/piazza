import { Model, model, Schema } from "mongoose";
import { IComment, ICommentDocument } from "../interfaces";

type CommentModel = Model<IComment, {}, {}>;

export const CommentSchema: Schema<ICommentDocument, CommentModel> = new Schema<
  ICommentDocument,
  {}
>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Comment = model<ICommentDocument>("Comment", CommentSchema);
