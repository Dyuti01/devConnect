import express, { Request, Response } from "express";
import { userAuth } from "../middlewares/auth";
import { connectionRequestModel } from "../models/connectionRequest";
import { userModel as User } from "../models/user";
import mongoose from "mongoose";

export const connectionRequestRouter = express.Router();

connectionRequestRouter.post(
  "/send/:status/:toUserId",
  userAuth,
  async function (req: Request, res: Response) {
    try {
      const user = req.body.user;
      const fromUserId = req.body._id;
      const toUserId: any = req.params.toUserId;
      const reqStatus = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(reqStatus)) {
        res.status(400).json({
          message: `Request not valid since already "${reqStatus}".`,
        });
        return;
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        res.status(404).json({ messgae: "No such user exist." });
        return;
      }
      //   if (fromUserId === toUserId) {  // managed by Schema.pre
      //     throw new Error("Request yourself not allowed.");
      //   }

      //   const already1 = await connectionRequestModel.findOne({fromUserId:fromUserId, toUserId:toUserId});
      //   const already2 = await connectionRequestModel.findOne({fromUserId:toUserId, toUserId:fromUserId});
      const already = await connectionRequestModel.findOne().or([
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ]);

      if (already) {
        //   if (already1 || already2){
        if (
          already.reqStatus === "ignored" ||
          already.reqStatus === "interested"
        ) {
          const r = await connectionRequestModel.findByIdAndUpdate(
            already._id,
            { reqStatus: reqStatus }
          );
          res.json({ message: "Request already sent.", Req: r });
          return;
        }
        if (already.reqStatus === "rejected") {
          res.status(400).json({ message: "Rejected request already." });
          return;
        }
        res.status(400).json({ message: "Request already sent." });
        return;
      }

      const connectionReq = new connectionRequestModel({
        fromUserId,
        toUserId,
        reqStatus,
      });
      const data = await connectionReq.save();

      res.json({ message: `Request sent to ${toUser.firstName}!`, data });
    } catch (err: any) {
      const message = err.message;
      res.status(400).json({ error: message });
    }
  }
);

// Reviewing request to accept or reject
connectionRequestRouter.post(
  "/review/:status/:reqId",
  userAuth,
  async function (req: Request, res: Response) {
    try {
      // fromUser => toUser
      // toUser is loggged in
      // status of request is interested initially

      const user = req.body.user;
      const fromUserId: string = req.body._id;
      const reqId: any = req.params.reqId;
      const reqStatus = req.params.status;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(reqStatus)) {
        res.status(400).json({
          message: `Request not valid since already "${reqStatus}".`,
        });
        return;
      }

      const connectionReq = await connectionRequestModel.findOne({
        _id: reqId,
        toUserId: fromUserId,
        reqStatus: "interested",
      });
      if (!connectionReq) {
        res.status(404).json({ messgae: "No such connectionReq exist." });
        return;
      }

      // if (fromUserId!==JSON.stringify(connectionReq.toUserId)){
      //     throw new Error("Can't accept.")
      // }

      // if (connectionReq.reqStatus==="accepted"){
      //     res.json({ message: "Request already 'accepted'." });
      //     return;
      // }
      // if (connectionReq.reqStatus==="ignored"||connectionReq.reqStatus==="rejected"){
      //     res.json({ message: `Request already ${reqStatus}.` });
      //     return;
      // }

      const toUser = await User.findById(connectionReq.fromUserId);

      if (!toUser) {
        throw new Error("Requester not exist.");
      }

      const data = await connectionRequestModel.findByIdAndUpdate(reqId, {
        reqStatus: reqStatus,
      });

      res.json({
        message: `Request ${reqStatus} for ${toUser.firstName}.`,
        data,
      });
    } catch (err: any) {
      const message = err.message;
      res.status(400).json({ error: message });
    }
  }
);
