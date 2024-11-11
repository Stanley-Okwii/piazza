import express, { Router } from 'express';
import { Types } from "mongoose";

import { Post } from '../models/Post';
import { Comment } from '../models/Comment';


const postsRouter: Router = express.Router();

// Create a single post
postsRouter.post('/', async(req,res) => {
    try {
        const userId = "672fabc8307ab120110a5b47";
        const expiresIn = req.body.expiresIn;
        // Calculate the expiration date
        const expiresAt = new Date(Date.now() + expiresIn * 60 * 1000);
        const newPost = await Post.create({
            author: userId,
            expiresAt,
            ...req.body
        })
        res.status(201).json(newPost);
    }catch(err){
        res.send({message:err})
    }
})

// Get all posts
// TODO: ADD query parameter for most active post, topic, expired?
postsRouter.get('/', async(req, res) => {
    try {
        let filters = {};
        console.log('query ', req.query);
        if(req.query && req.query.topic && typeof req.query.topic === 'string' ){ // Assume: Only one topics posts can seen at time..
            filters = {topics: [req.query.topic]}
        }
        if(req.query && req.query.expired && typeof req.query.expired === 'string' ){ // Assume: Only one topics posts can seen at time..
            const currentTime = new Date();
            if(req.query.expired === "true"){
                filters = {expiresAt: { $lt: currentTime }, ...filters}
            } else {
                filters = {expiresAt: { $gt: currentTime }, ...filters}
            }
        }
        console.log(filters)
        const allPosts = await Post.find(filters).populate('author', "email firstName lastName").populate('comments', 'content')
        res.send(allPosts)
    } catch(err){
        res.send({message:err})
    }
})

// Get post by postId, 
postsRouter.get('/:postId', async(req,res) => {
    try {
        const getPostById = await Post.findById(req.params.postId).populate('author', "email firstName lastName").populate('comments', 'content')
        res.status(200).json(getPostById)
    } catch(err){
        res.send({message:err})
    }
})

// Get active post 
postsRouter.get('/active', async(req,res) => {
    try {

                const result = await Post.aggregate([
                    // Filter for unexpired posts
                    { $match: { expiresAt: { $gt: new Date() } } },
              
                    // Project the total reactions by summing the sizes of `likes` and `dislikes` arrays
                    {
                      $project: {
                        title: 1,
                        content: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        expiresAt: 1,
                        totalReactions: {
                          $add: [{ $size: "$likes" }, { $size: "$dislikes" }],
                        },
                      },
                    },
              
                    // Sort by `totalReactions` in descending order
                    { $sort: { totalReactions: -1 } },
              
                    // Limit to the top post with the highest reactions
                    { $limit: 1 },
                  ]);
                  const ress = result.length > 0 ? result[0] : null;
        res.status(200).json(ress)
    } catch(err){
        res.send({message:err})
    }
})


// Update post by postId
postsRouter.patch('/:postId', async(req,res) =>{
    try {
        const updatePostById = await Post.updateOne(
            {_id:req.params.postId},
            {$set:{
                author:req.body.user,
                title:req.body.title,
                text:req.body.text,
                hashtag:req.body.hashtag,
                location:req.body.location,
                url:req.body.url
                }
            })
        res.send(updatePostById)
    } catch(err){
        res.send({message:err})
    }
})

// Delete a post by postId
postsRouter.delete('/:postId',async(req,res)=>{
    try {
        const postToDelete = await Post.deleteOne({_id:req.params.postId})
        res.send(postToDelete)
    } catch(err) {
        res.send({message:err})
    }
})

// Like a post
postsRouter.post('/:postId/like',async(req,res)=>{
    try {
        const post = await Post.findById({_id:req.params.postId})
        if(post){
            const userId = "672fe3c225e13979680b0fea";
            if(post.isExpired()) {
                res.status(400).json({"message": "You can not like an expired post"});
                return;
            }
            if(String(post?.author) === userId) {
                res.status(400).json({"message": "You can not like your own post"});
                return;
            }
            if(post.isLikedByUser(userId)){
                res.status(400).json({"message": "You have already liked this Post"});
            } else {
                await Post.findByIdAndUpdate(req.params.postId, { $addToSet: { likes: userId } })
                res.status(200).json({"message": "Successfully liked post"});
            }
        }
    } catch(err) {
        res.send({message:err})
    }
})

// Dislike a post
postsRouter.post('/:postId/dislike',async(req,res)=>{
    try {
        const post = await Post.findById({_id:req.params.postId})
        if(post){
            const userId = "672fe3c225e13979680b0fea";
            if(post.isExpired()) {
                res.status(400).json({"message": "You can not dislike an expired post"});
            }
            if(String(post?.author) === userId) {
                res.status(400).json({"message": "You can not dislike your own post"});
            }
            if(post.isDislikedByUser(userId)){
                res.status(400).json({"message": "You have already disliked this Post"});
            } else {
                await Post.findByIdAndUpdate(req.params.postId, { $addToSet: { dislikes: userId } })

                // TODO:  Remove like is a user has disliked as post that they previous liked...
                res.status(200).json({"message": "Successfully disliked post"});
            }
        }
    } catch(err) {
        res.send({message:err})
    }
})

// Comment on a post
postsRouter.post('/:postId/comment', async(req,res)=>{
    const userId = "672fe3c225e13979680b0fea";
    const post = await Post.findById(req.params.postId);
    if(!post){
        res.status(400).json({message: `Post with id: ${req.params.postId} was not found`});
        return;
    }
    if(post.isExpired()) {
        res.status(400).json({"message": "You can not comment on an expired post"});
        return;
    }
    try {
        const comment = await Comment.create({
            author: userId,
            content: req.body.content
        })
        await Post.findByIdAndUpdate(req.params.postId, { $addToSet: { comments: comment.id } })
        res.status(201).json(comment);
    } catch(err) {
        res.send({message:err})
    }
})

export { postsRouter };
