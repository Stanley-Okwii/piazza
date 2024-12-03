import Joi from "joi";

import {
  IUser,
  IPost,
  IUserID,
  IPostID,
  ICommentID,
  IComment,
} from "../interfaces";

export const User = (data: IUser): Joi.ValidationResult => {
  const schemaValidation = Joi.object({
    email: Joi.string().required().min(6).max(100).email(),
    firstName: Joi.string().required().min(5).max(100),
    lastName: Joi.string().required().min(5).max(100),
    password: Joi.string()
      .required()
      .min(6)
      .max(25)
      .pattern(new RegExp("^[a-zA-Z0-9]{6,25}$")), // Ensure the password is 6-25 characters long and contains only letters or digits
  });
  return schemaValidation.validate(data);
};

export const UserLogin = (data: IUser): Joi.ValidationResult => {
  const schemaValidation = Joi.object({
    email: Joi.string().required().min(6).max(100).email(),
    password: Joi.string()
      .required()
      .min(6)
      .max(25)
      .pattern(new RegExp("^[a-zA-Z0-9]{6,25}$")), // Ensure the password is 6-25 characters long and contains only letters or digits
  });
  return schemaValidation.validate(data);
};

export const UserID = (data: IUserID): Joi.ValidationResult => {
  const schemaValidation = Joi.object({
    userId: Joi.string().required().min(24).max(40), // uuid length validation
  });
  return schemaValidation.validate(data);
};

export const Post = (data: IPost): Joi.ValidationResult => {
  const schemaValidation = Joi.object({
    author: Joi.string().required().min(24).max(40), // uuid length validation
    title: Joi.string().required().min(6).max(150),
    content: Joi.string().required().min(15).max(256),
    topics: Joi.array().required().length(1),
    expiresIn: Joi.number().required().positive(),
  });
  return schemaValidation.validate(data);
};

export const PostSearchParams = (data: any): Joi.ValidationResult => {
  const schemaValidation = Joi.object({
    active: Joi.boolean(),
    expired: Joi.boolean(),
    // Ensure only topics included below are used when querying by topic
    topic: Joi.string()
      .min(4)
      .max(50)
      .valid("Politics", "Health", "Sports", "Tech"),
  })
    // Ensure that active search parameter can not be used with expired parameter
    .without("active", ["expired"])
    // Ensure that active search parameter is ALWAYS used together with the topic parameter
    .with("active", "topic");
  return schemaValidation.validate(data);
};

export const PostID = (data: IPostID): Joi.ValidationResult => {
  const schemaValidation = Joi.object({
    postId: Joi.string().required().min(24).max(40), // uuid length validation
  });
  return schemaValidation.validate(data);
};

export const Comment = (data: IComment): Joi.ValidationResult => {
  const schemaValidation = Joi.object({
    content: Joi.string().required().min(4).max(256),
  });
  return schemaValidation.validate(data);
};

export const CommentID = (data: ICommentID): Joi.ValidationResult => {
  const schemaValidation = Joi.object({
    commentId: Joi.string().required().min(24).max(40), // uuid length validation
  });
  return schemaValidation.validate(data);
};
