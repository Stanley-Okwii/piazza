import express from 'express';
import { User } from '../models/User';


const router = express.Router();

// Create/register a user
router.post('/', async(req,res) => {
    try {
        // email: string,
        // firstName: string,
        // lastName: string,
        // password: string,
        // const data = req.body;
        const newUser = await User.create(req.body);
        res.send(newUser)
    }catch(err){
        res.send({message:err});
    }
})

// Get all users
router.get('/', async(_,res) =>{
    try {
        const users = await User.find()
        res.send(users)
    } catch(err){
        res.send({message:err})
    }
})

// Get post by userId
router.get('/:userId', async(req,res) =>{
    try {
        const user = await User.findById(req.params.userId)
        res.send(user)
    } catch(err){
        res.send({message:err})
    }
})

// Update user by userId
router.patch('/:userId', async(req,res) =>{
    try {
        const user = await User.updateOne(
            {_id:req.params.userId},
            {$set: req.body })
        res.send(user);
    } catch(err){
        res.send({message:err});
    }
})

// Delete a user by userId
router.delete('/:userId',async(req,res)=>{
    try {
        const deletedUser = await User.deleteOne({_id:req.params.userId})
        res.send(deletedUser)
    } catch(err) {
        res.send({message:err})
    }
})

export { router };
