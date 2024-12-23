import mongoose from "mongoose";
export interface connectionReq {
    fromUserId: mongoose.Schema.Types.ObjectId;
    toUserId: mongoose.Schema.Types.ObjectId;
    reqStatus: string;
}
export declare const connectionRequestModel: mongoose.Model<connectionReq, {}, {}, {}, mongoose.Document<unknown, {}, connectionReq> & connectionReq & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
