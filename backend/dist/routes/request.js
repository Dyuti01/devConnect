"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionRequestRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const connectionRequest_1 = require("../models/connectionRequest");
const user_1 = require("../models/user");
exports.connectionRequestRouter = express_1.default.Router();
exports.connectionRequestRouter.post("/send/:status/:toUserId", auth_1.userAuth, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.body.user;
            const fromUserId = req.body._id;
            const toUserId = req.params.toUserId;
            const reqStatus = req.params.status;
            const allowedStatus = ["ignored", "interested"];
            if (!allowedStatus.includes(reqStatus)) {
                res.status(400).json({
                    message: `Request not valid since already "${reqStatus}".`,
                });
                return;
            }
            const toUser = yield user_1.userModel.findById(toUserId);
            if (!toUser) {
                res.status(404).json({ messgae: "No such user exist." });
                return;
            }
            const already = yield connectionRequest_1.connectionRequestModel.findOne().or([
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId },
            ]);
            if (already) {
                if (already.reqStatus === "ignored" ||
                    already.reqStatus === "interested") {
                    const r = yield connectionRequest_1.connectionRequestModel.findByIdAndUpdate(already._id, { reqStatus: reqStatus });
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
            const connectionReq = new connectionRequest_1.connectionRequestModel({
                fromUserId,
                toUserId,
                reqStatus,
            });
            const data = yield connectionReq.save();
            res.json({ message: `Request sent to ${toUser.firstName}!`, data });
        }
        catch (err) {
            const message = err.message;
            res.status(400).json({ error: message });
        }
    });
});
exports.connectionRequestRouter.post("/review/:status/:reqId", auth_1.userAuth, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.body.user;
            const fromUserId = req.body._id;
            const reqId = req.params.reqId;
            const reqStatus = req.params.status;
            const allowedStatus = ["accepted", "rejected"];
            if (!allowedStatus.includes(reqStatus)) {
                res.status(400).json({
                    message: `Request not valid since already "${reqStatus}".`,
                });
                return;
            }
            const connectionReq = yield connectionRequest_1.connectionRequestModel.findOne({
                _id: reqId,
                toUserId: fromUserId,
                reqStatus: "interested",
            });
            if (!connectionReq) {
                res.status(404).json({ messgae: "No such connectionReq exist." });
                return;
            }
            const toUser = yield user_1.userModel.findById(connectionReq.fromUserId);
            if (!toUser) {
                throw new Error("Requester not exist.");
            }
            const data = yield connectionRequest_1.connectionRequestModel.findByIdAndUpdate(reqId, {
                reqStatus: reqStatus,
            });
            res.json({
                message: `Request ${reqStatus} for ${toUser.firstName}.`,
                data,
            });
        }
        catch (err) {
            const message = err.message;
            res.status(400).json({ error: message });
        }
    });
});
