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
    email: Joi.string().required().min(6).max(100).email(), //TODO: make validations consistent with DB ones
    firstName: Joi.string().required().min(5).max(100),
    lastName: Joi.string().required().min(5).max(100),
    password: Joi.string()
      .required()
      .min(6)
      .max(8)
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
  });
  return schemaValidation.validate(data);
};

export const UserLogin = (data: IUser): Joi.ValidationResult => {
  const schemaValidation = Joi.object({
    email: Joi.string().required().min(6).max(100).email(), //TODO: make validations consistent with DB ones
    password: Joi.string()
      .required()
      .min(6)
      .max(8)
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
  });
  return schemaValidation.validate(data);
};

export const UserID = (data: IUserID): Joi.ValidationResult => {
  const schemaValidation = Joi.object({
    userId: Joi.string().required().min(6).max(100),
  });
  return schemaValidation.validate(data);
};

export const Post = (data: IPost): Joi.ValidationResult => {
  const schemaValidation = Joi.object({
    author: Joi.string().required().min(6).max(100).email(),
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
    // Validation to ensure only search by allowed topic values
    topic: Joi.string().min(4).max(50).valid('Politics', 'Health','Sports', 'Tech'),
    // Validation to ensure that active parameter can not be used with expired parameter
  })
    .without("active", ["expired"])
    // Validation to ensure that active parameter is ALWAYS used together with the topic parameter
    .with("active", "topic");
  return schemaValidation.validate(data);
};

export const PostID = (data: IPostID): Joi.ValidationResult => {
  const schemaValidation = Joi.object({
    postId: Joi.string().required().min(6).max(100),
  });
  return schemaValidation.validate(data);
};

export const Comment = (data: IComment): Joi.ValidationResult => {
  const schemaValidation = Joi.object({
    content: Joi.string().required().min(6).max(256),
  });
  return schemaValidation.validate(data);
};

export const CommentID = (data: ICommentID): Joi.ValidationResult => {
  const schemaValidation = Joi.object({
    commentId: Joi.string().required().min(6).max(100),
  });
  return schemaValidation.validate(data);
};
