import express from 'express';
import { Post } from '../models/Post';


const router = express.Router();

// Create a single post
router.post('/', async(req,res) => {
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
router.get('/', async(req,res) =>{
    try {
        const allPosts = await Post.find().populate('author', "email firstName lastName")
        res.send(allPosts)
    } catch(err){
        res.send({message:err})
    }
})

// Get post by postId
router.get('/:postId', async(req,res) =>{
    try {
        const getPostById = await Post.findById(req.params.postId).populate('author', "email firstName lastName")
        res.status(200).json(getPostById)
    } catch(err){
        res.send({message:err})
    }
})

// Update post by postId
router.patch('/:postId', async(req,res) =>{
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
router.delete('/:postId',async(req,res)=>{
    try {
        const deletePostById = await Post.deleteOne({_id:req.params.postId})
        res.send(deletePostById)
    } catch(err) {
        res.send({message:err})
    }
})

export { router };
