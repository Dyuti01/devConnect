import express, { Request, Response, NextFunction } from 'express'

import jwt from 'jsonwebtoken';
// import cookieParser from 'cookie-parser';  // not needed here since already present in app
import { userModel as User } from '../models/user';

 export const userAuth = async (req:Request, res:Response, next:NextFunction)=>{
  try{
    const cookies = req.cookies;
    const { token } = cookies;
    
    if (req.method==="PATCH"){
      req.body = { updateData: req.body }
    }

    if (!token){
      throw new Error("Invalid token!");
    }


    const decoded = await jwt.verify(token, "DEV@Tinder$790");

    const dataObj = JSON.parse(JSON.stringify(decoded));

    const { _id } = dataObj;

    const user = await User.findById(_id);
    if (!user){
      throw new Error("User not present!");
    }

    req.body = {_id, user, ...req.body};
    next();
  }  
  catch(err:any){
    const message = err.message;
    res.status(400).json({error:"Invalid credentials!", message})
  }
 }