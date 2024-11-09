import { Model, model, Schema } from "mongoose";
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
>({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
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
  expiresAt: {
    type: Date,
    required: true,
  }
}, { timestamps: true });
// timestamps adds createdAt and modifiedAt attributes to the model

PostSchema.method("isExpired", function isExpired() {
  const currentTime = new Date();
  return currentTime > this.expiresAt;
});

// Middleware to check and update `status` on individual documents after a query
async function setExpirationStatus(post: IPostDocument) {
    
    if (post.isExpired() && post.status !== Status.Expired) {
      post.status = Status.Expired;
      await post.save();
    }
  }
  
  // Apply middleware after `find` to each document in the result set
PostSchema.pre("find", async function (next) {
    // console.log('print ', this.getQuery());
    // debugger
    // console.log('posts ', await this.model.find({'status': Status.Live}));
    try {
    const posts: Array<IPostDocument> = await this.model.find({'status': Status.Live});
    console.log('posts ', posts);

    // posts.forEach((post: IPostDocument) => {
    //     // setExpirationStatus(post)});
    // post.status = Status.Expired;
    // await post.save();
    // });
    for (const post of posts) {
        if (post.isExpired()) {
            post.status = Status.Expired;
            await post.save();
        }
      }
      next();
    } catch (err) {
        console.log('err', err);
        next()
    }
});

// Apply middleware after `findOne` to a single document
PostSchema.pre("findOne", async function (next) {
    const post: IPostDocument | null = await this.model.findOne({'status': Status.Expired});
    if (post) {
        setExpirationStatus(post);
    }
    return next();
});
  
// Set updatedAt value each time a Post document is updated
// PostSchema.pre("updateOne", function () {
// this.set({ updatedAt: new Date() });
// });
// Pre Get 
export const Post = model<IPostDocument>("Post", PostSchema);
