import { Model, model, Schema } from "mongoose";

import { IPost, IPostMethods, IPostDocument } from "../interfaces";
import { setExpirationStatus, isLikedOrDislikedByUser } from "../utils";
import { Topic, Status } from "../utils/enums";

// Create PostModel type that's aware of PostMethods
type PostModel = Model<IPost, {}, IPostMethods>;

export const PostSchema: Schema<IPostDocument, PostModel> = new Schema<
  IPostDocument,
  {},
  IPostMethods
>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    topics: [
      {
        type: String,
        enum: Topic,
        required: true,
      },
    ],
    status: {
      type: String,
      enum: Status,
      default: Status.Live,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    expiresAt: {
      type: Date,
      required: true,
    },
    reactionsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and modifiedAt fields to Schema
    toJSON: {
      // Override the API response of likes and dislikes to return a count instead of a list of IDs
      transform: function (_, record) {
        record.likes = record.likes.length;
        record.dislikes = record.dislikes.length;
        return record;
      },
    },
  }
);


// SCHEMA Functions
// Define function that returns a whether a post is expired or not
PostSchema.method("isExpired", function isExpired(): boolean {
  const currentTime: Date = new Date();
  return currentTime > this.expiresAt;
});

// Define function that returns a whether a post is liked by a given user or not
PostSchema.method(
  "isLikedByUser",
  function(userId):boolean {return isLikedOrDislikedByUser(userId, this.likes)},
);

// Define function that returns a whether a post is disliked by a given user or not
PostSchema.method(
  "isDislikedByUser",
  function(userId: string): boolean {
    return isLikedOrDislikedByUser(userId, this.dislikes);
  }
);

// SCHEMA MIDDLEWARE
// Apply middleware after the `find` query to each document in the result set
PostSchema.post("find", async function (posts: Array<IPostDocument>): Promise<void> {
  const livePosts: Array<IPostDocument> = posts.filter(
    (post) => post.status !== "Expired"
  );
  for (const post of livePosts) {
    if (post.isExpired()) {
      setExpirationStatus(post);
    }
  }
});

// Apply middleware after  the`findOne` query to a single document
PostSchema.post("findOne", async function (post: IPostDocument): Promise<void> {
  if (post && post.status && post.status === Status.Live) {
    setExpirationStatus(post);
  }
});

// Apply middleware to after `findOneAndUpdate` query to compute dislike and likes
// to ensure active post is easily computed based on reactionsCount
PostSchema.post("findOneAndUpdate", async function (): Promise<void> {
  const post: IPostDocument | null = await this.model.findOne(this.getQuery());
  if (post) {
    const sumOfReactions: number =
      (post.likes ? post.likes.length : 0) +
      (post.dislikes ? post.dislikes.length : 0);
    post.reactionsCount = sumOfReactions;
    await post.save();
  }
});

export const Post = model<IPostDocument>("Post", PostSchema);
