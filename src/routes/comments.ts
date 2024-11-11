import express, { Request, Response } from 'express';
import { Comment } from '../models/Comment';


const commentsRouter = express.Router();

// Get comment by comment id
commentsRouter.get('/:commentId', async(req,res) =>{
    try {
        const comment = await Comment.findById(req.params.commentId);
        res.send(comment);
    } catch(err){
        res.send({message:err})
    }
})

// Update comment by comment id
commentsRouter.patch('/:commentId', async(req,res) =>{
    try {
        const user = await Comment.updateOne(
            {_id:req.params.commentId},
            {$set: req.body })
        res.send(user);
    } catch(err){
        res.send({message:err});
    }
})

// Delete a comment by id
commentsRouter.delete('/:commentId', async(req,res) => {
    try {
        const deletedComment = await Comment.deleteOne({_id: req.params.commentId})
        res.send(deletedComment)
    } catch(err) {
        res.send({message:err})
    }
})

export { commentsRouter };
