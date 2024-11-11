import { Model, model, Schema, Types } from "mongoose";
import { IPost, IPostMethods, IPostDocument } from "../interfaces/Post";

enum Topic {
  POLITICS = "Politics",
  HEALTH = "Health",
  SPORTS = "Sports",
  TECH = "Tech",
};

enum Status {
  Live = "Live",
  Expired = "Expired",
};

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
  },
  { timestamps: true,
    toJSON: {
        // Override the response of likes and dislikes to return a count instead of a list of IDs
    transform: function (doc, ret) {
      ret.likes = ret.likes.length;
      ret.dislikes = ret.dislikes.length
      return ret;
    },
  }, }
);
// timestamps adds createdAt and modifiedAt attributes to the model

PostSchema.method("isExpired", function isExpired() {
  const currentTime = new Date();
  return currentTime > this.expiresAt;
});

PostSchema.method("isLikedByUser", function isLikedByUser(userId: string) {
    const likes = this.likes.map((id: Types.ObjectId) => String(id)); // Cast ObjectId to strings because we need compare them
    return likes.includes(userId)
});

PostSchema.method("isDislikedByUser", function isDislikedByUser(userId: string) {
    const dislikes = this.dislikes.map((id: Types.ObjectId) => String(id)); // Cast ObjectId to strings because we need compare them
    return dislikes.includes(userId);
});

// Middleware to check and update `status` on individual documents after a query
async function setExpirationStatus(post: IPostDocument) {
  if (post.isExpired() && post.status !== Status.Expired) {
    post.status = Status.Expired;
    await post.save();
  }
};

// Apply middleware after `find` to each document in the result set
PostSchema.post("find", async function (posts: Array<IPostDocument>) {
  const livePosts: Array<IPostDocument> = posts.filter(
    (p) => p.status !== "Expired"
  );
  for (const post of livePosts) {
    if (post.isExpired()) {
      setExpirationStatus(post);
    }
  }
});

// Apply middleware after `findOne` to a single document
PostSchema.post("findOne", async function (post) {
  if (post && post.status && post.status === Status.Live) {
    setExpirationStatus(post);
  }
});

export const Post = model<IPostDocument>("Post", PostSchema);
