import { string, object, array, number }  from 'joi';
import { IUser } from '../interfaces/User';
import { IPost } from '../interfaces/Post';


export const User = (data: IUser) => {
    const schemaValidation = object({
        email: string().required().min(6).max(100).email(),
        firstName: string().required().min(6).max(100),
        lastName: string().required().min(6).max(100),
        password: string().required().min(6).max(8).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    })
    return schemaValidation.validate(data)
}

export const UserID= (data: any) => {
    const schemaValidation = object({
        userId: string().required().min(6).max(100),
    })
    return schemaValidation.validate(data)
}

export const Post = (data: IPost) => {
    const schemaValidation = object({
        author: string().required().min(6).max(100).email(),
        title: string().required().min(6).max(150),
        content: string().required().min(15).max(256),
        topics: array().required().length(1),
        expiresIn: number().required().positive(),
    })
    return schemaValidation.validate(data)
}

export const PostID = (data: any) => {
    const schemaValidation = object({
        postId: string().required().min(6).max(100)
    })
    return schemaValidation.validate(data)
}

export const Comment = (data: any) => {
    const schemaValidation = object({
        content: string().required().min(6).max(256)
    })
    return schemaValidation.validate(data)
}

export const CommentID = (data: any) => {
    const schemaValidation = object({
        commentId: string().required().min(6).max(100)
    })
    return schemaValidation.validate(data)
}