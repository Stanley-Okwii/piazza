import Joi from 'joi';

import { IUser } from '../interfaces/User';
import { IPost } from '../interfaces/Post';


export const User = (data: IUser) => {
    const schemaValidation = Joi.object({
        email: Joi.string().required().min(6).max(100).email(), //TODO: make validations consistent with DB ones
        firstName: Joi.string().required().min(5).max(100),
        lastName: Joi.string().required().min(5).max(100),
        password: Joi.string().required().min(6).max(8).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    })
    return schemaValidation.validate(data)
}

export const UserLogin = (data: IUser) => {
    const schemaValidation = Joi.object({
        email: Joi.string().required().min(6).max(100).email(), //TODO: make validations consistent with DB ones
        password: Joi.string().required().min(6).max(8).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    })
    return schemaValidation.validate(data)
}

export const UserID= (data: any) => {
    const schemaValidation = Joi.object({
        userId: Joi.string().required().min(6).max(100),
    })
    return schemaValidation.validate(data)
}

export const Post = (data: IPost) => {
    const schemaValidation = Joi.object({
        author: Joi.string().required().min(6).max(100).email(),
        title: Joi.string().required().min(6).max(150),
        content: Joi.string().required().min(15).max(256),
        topics: Joi.array().required().length(1),
        expiresIn: Joi.number().required().positive(),
    })
    return schemaValidation.validate(data)
}

export const PostID = (data: any) => {
    const schemaValidation = Joi.object({
        postId: Joi.string().required().min(6).max(100)
    })
    return schemaValidation.validate(data)
}

export const Comment = (data: any) => {
    const schemaValidation = Joi.object({
        content: Joi.string().required().min(6).max(256)
    })
    return schemaValidation.validate(data)
}

export const CommentID = (data: any) => {
    const schemaValidation = Joi.object({
        commentId: Joi.string().required().min(6).max(100)
    })
    return schemaValidation.validate(data)
}