import { Response, Request, NextFunction } from "express";
import { verify, JwtPayload } from "jsonwebtoken";
import { env } from 'node:process';

import { UserJwtPayload } from "../interfaces"


export const validateRequest = (
  validate: Function,
  requestBody: Object,
  response: Response
): void => {
  const { error } = validate(requestBody);
  if (error) {
    response.status(400).json({ message: error["details"][0]["message"] });
    return;
  }
};


export const verifyAuth = (request: Request, response: any, next: NextFunction): void => {
    const token: string | undefined = request.header('Auth-Token')
    if(!token){
        return response.status(401).send({message:'No token provided'})
    }
    try{
        const payload: JwtPayload | String  = verify(token, `${env.TOKEN_SECRET}`);
        const userId: string = (payload as UserJwtPayload)._id;
        response.set('userId', userId); // Set userId to response headers which is later used to identify and logged in user
        next();
    }catch(error){
        return response.status(401).send({message:'Invalid token'})
    }
}

