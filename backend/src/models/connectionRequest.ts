import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export interface connectionReq {
  fromUserId: mongoose.Schema.Types.ObjectId;
  toUserId: mongoose.Schema.Types.ObjectId;
  reqStatus: string;
}

const connectionRequestSchema = new mongoose.Schema<connectionReq>(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      reqired: true,
    },
    reqStatus: {
      type: String,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status! `,
      },
      required: true,
    },
  },
  { timestamps: true }
);

connectionRequestSchema.index({fromUserId:1, toUserId:1})

connectionRequestSchema.pre("save", function(next){
  const connectionReq = this;
  const fromUserId = JSON.stringify(connectionReq.fromUserId);
  const toUserId = JSON.stringify(connectionReq.toUserId);

  if (fromUserId===toUserId){
    throw new Error("Request yourself not allowed.");
  }
  next();
})

export const connectionRequestModel = mongoose.model<connectionReq>(
  "connectionReq",
  connectionRequestSchema
);
