import { Document } from 'mongoose';

export interface IPost {
    author: Document,
    title: string,
    content: string,
    topics: Array<{ name: string }>,
    status: string,
    expiresAt: Date,
    createdAt: Date,
    updatedAt: Date
}

export interface IPostMethods {
    isExpired(): string;
}

// Extend 
export interface IPostDocument extends IPost, Document, IPostMethods {}
