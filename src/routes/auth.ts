import express, { Request, Response } from "express";
import {compare} from "bcryptjs";
import { sign } from  "jsonwebtoken";
import { env } from 'node:process';

import { User } from "../models/User";
import { UserLogin } from "../validators";
import { validateRequest } from "../utils";

const authRouter = express.Router();


authRouter.post('/login', async (request: Request, response: Response) => {
    validateRequest(UserLogin,request.body, response)

    const user = await User.findOne({email: request.body.email});
    if(!user){
        response.status(400).send({message:'User does not exist'});
        return;
    } 

    const passwordValidation = await compare(request.body.password, user.password)
    if(!passwordValidation){
        response.status(400).send({message:'Wrong password, check your password and try again'});
        return;
    }
    
    // Generate auth-token based on user_id
    const token = sign({_id: user._id}, `${env.TOKEN_SECRET}`)
    response.header('Auth-Token',token).send({'Auth-Token': token});
});

export { authRouter };
