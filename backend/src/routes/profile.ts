import express, { Request, Response } from 'express';
import { userAuth } from '../middlewares/auth';
import { userModel as User } from '../models/user';
import { validateProfileUpdateData } from '../utils/validation';
import { connectionRequestModel } from '../models/connectionRequest';

export const profileRouter = express.Router();

profileRouter.get("/view", userAuth, async (req:Request, res:Response)=>{
  try{
      const {_id, user } = req.body;
      res.json({message:"Logged in userId : " + _id, user});
  }
  catch(err:any){
    const message = err.message;
    res.status(400).json({error:"Invalid credentials!", message})
  }
})
// Update user info
profileRouter.patch("/edit", userAuth, async (req, res) => {
  try {
    const userId = req.body._id;
    const dataObj = req.body.updateData;

    if (!validateProfileUpdateData(req)) {
      throw new Error("Update not allowed!");
    }
    if (dataObj.skills.length > 10) {
      throw new Error("Can't add more than 10 skills...");
    }
    const user = await User.findByIdAndUpdate(userId, dataObj, {
      returnDocument: "before",
      runValidators: true,
    });

    res.json({ msg: "Updated successfully..." });
  } catch (err) {
    res.status(400).json({ msg: "Something went wrong, " + err });
  }
});

profileRouter.delete("/erase", userAuth, async (req, res) => {
  const loggedUserId = req.body._id;
  try {
    const user = await User.findByIdAndDelete(loggedUserId);
    await connectionRequestModel.deleteMany({fromUserId:loggedUserId});
    await connectionRequestModel.deleteMany({toUserId:loggedUserId});

    res.json({ msg: "User deleted successfullly..." });
  } catch (err) {
    res.status(400).json({ error: "Something went wrong", err });
  }
});
