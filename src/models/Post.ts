import { Document, Model, model, Schema, Types } from "mongoose";
import { IPost, IPostMethods, IPostDocument } from "../interfaces/Post";

enum Topic {
  POLITICS = "Politics",
  HEALTH = "Health",
  SPORTS = "Sports",
  TECH = "Tech",
}

enum Status {
  Live = "Live",
  Expired = "Expired",
}

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
    timestamps: true,
    toJSON: {
      // Override the response of likes and dislikes to return a count instead of a list of IDs
      transform: function (_, record) {
        record.likes = record.likes.length;
        record.dislikes = record.dislikes.length;
        return record;
      },
    },
  }
);
// TODO: add virtual attributes for like count and dislike count and reactions count
// timestamps adds createdAt and modifiedAt attributes to the model

PostSchema.method("isExpired", function isExpired() {
  const currentTime = new Date();
  return currentTime > this.expiresAt;
});

PostSchema.method("isLikedByUser", function isLikedByUser(userId: string) {
  const likes = this.likes.map((id: Types.ObjectId) => String(id)); // Cast ObjectId to strings because we need compare them
  return likes.includes(userId);
});

PostSchema.method(
  "isDislikedByUser",
  function isDislikedByUser(userId: string) {
    const dislikes = this.dislikes.map((id: Types.ObjectId) => String(id)); // Cast ObjectId to strings because we need compare them
    return dislikes.includes(userId);
  }
);

// Schema Middleware
// Function to check and update `status` on individual documents after a query
async function setExpirationStatus(post: IPostDocument) {
  if (post.isExpired() && post.status !== Status.Expired) {
    post.status = Status.Expired;
    await post.save();
  }
}

// Apply middleware after `find` to each document in the result set
PostSchema.post("find", async function (posts: Array<IPostDocument>) {
  const livePosts: Array<IPostDocument> = posts.filter(
    (post) => post.status !== "Expired"
  );
  for (const post of livePosts) {
    if (post.isExpired()) {
      setExpirationStatus(post);
    }
  }
});

// Apply middleware after `findOne` to a single document
PostSchema.post("findOne", async function (post: IPostDocument) {
  if (post && post.status && post.status === Status.Live) {
    setExpirationStatus(post);
  }
});

// Sum update dislike and likes to ensure active post is easily computed
PostSchema.post("findOneAndUpdate", async function () {
  const post: IPostDocument | null = await this.model.findOne(this.getQuery());
  if (post) {
    const sumOfReactions: number = post.likes.length + post.dislikes.length;
    post.reactionsCount = sumOfReactions;
    await post.save();
  }
});

export const Post = model<IPostDocument>("Post", PostSchema);
