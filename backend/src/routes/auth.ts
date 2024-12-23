import express, { Request, Response } from 'express';
import { userAuth } from '../middlewares/auth';
import { userModel as User } from '../models/user';
import { validateSignUpData } from '../utils/validation';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const authRouter = express.Router();

authRouter.post("/signup", async (req:Request, res:Response) => {
  try {
    // validate the data
    validateSignUpData(req);

    // Encrypt the password
    const { firstName ,lastName, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 11);

    // Creating an instance of the User model
    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });

    await user.save();

    res.json({ status: "User created" });
  } catch (err: any) {
    const message = err.message;
    res.status(400).json({ error: message });
  }
});

authRouter.post("/login", async (req, res)=>{
  try{
    const { userEmail, password } = req.body; // // This password is from user during login
    const user = await User.findOne({email:userEmail});
    if (!user){
      res.status(404).json({error:"Invalid credentials!"});
      return;
    }
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid){
  
      const token = await user.getJWT();

      // Add the token to the cookie and send the response back to the user

      // Better use maxAge rather than milliseconds in expires
      res.cookie("token", token, { maxAge: 24*3600000, path:"/", httpOnly:true, secure:true });

      res.json({message:"Successfully logged in!"});
    }
    else{
      // res.clearCookie("token", {path: "/login"});
      // res.clearCookie("token", {path: "/"});
      res.json({message:"Invalid credentials!"});
    }
  }
  catch (err: any) {
    const message = err.message;
    res.status(400).json({ error: message });
  }
})

authRouter.post("/logout", userAuth, async (req, res)=>{
  try{
    // g(req.originalUrl);
    res.clearCookie("token", {path:"/"})
    .json({message: "Logout successfully!"});
  }
  catch (err: any) {
    const message = err.message;
    res.status(400).json({ error: message });
  }
})

authRouter.patch("/forgotPassword", async (req:Request, res:Response)=>{
  try{
    const { userEmail, oldPassword, newPassword } = req.body;
    const user = await User.findOne({email: userEmail});

    if (!user){
      throw new Error("Invalid credentials!");
    }
    const hash = user.password;

    const isCorrectPassword = await bcrypt.compare(oldPassword, hash);

    if (!isCorrectPassword){
      throw new Error("Invalid credentials!");
    }
    const newHash = await bcrypt.hash(newPassword, 11);

    await User.findByIdAndUpdate(user._id, {password:newHash});

    res.json({message: "Your password is changed successfully!"});
  }
  catch (err: any) {
    const message = err.message;
    res.status(400).json({ error: message });
  }

})


