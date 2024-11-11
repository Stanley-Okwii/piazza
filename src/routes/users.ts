import express, {Request, Response} from 'express';
import { User } from '../models/User';


const usersRouter = express.Router();

// Create/register a user
usersRouter.post('/', async(req: Request, res: Response) => {
    try {
        const newUser = await User.create(req.body);
        res.send(newUser)
    }catch(err){
        res.send({message:err});
    }
})

// Get all users
usersRouter.get('/', async(_,res) => {
    try {
        const users = await User.find()
        res.send(users)
    } catch(err){
        res.send({message:err})
    }
})

// Get user by userId
usersRouter.get('/:userId', async(req,res) =>{
    try {
        const user = await User.findById(req.params.userId)
        res.send(user)
    } catch(err){
        res.send({message:err})
    }
})

// Update user by userId
usersRouter.patch('/:userId', async(req,res) =>{
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
usersRouter.delete('/:userId',async(req,res)=>{
    try {
        const deletedUser = await User.deleteOne({_id:req.params.userId})
        res.send(deletedUser)
    } catch(err) {
        res.send({message:err})
    }
})

export { usersRouter };
