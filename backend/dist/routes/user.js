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
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const user_1 = require("../models/user");
const connectionRequest_1 = require("../models/connectionRequest");
exports.userRouter = express_1.default.Router();
const USER_SAFE_DATA = "firstName lastName photoUrl about skills";
exports.userRouter.get("/connections", auth_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loggedUserId = req.body._id;
        const connections = yield connectionRequest_1.connectionRequestModel
            .find({
            $or: [
                {
                    fromUserId: loggedUserId,
                    reqStatus: "accepted",
                },
                {
                    toUserId: loggedUserId,
                    reqStatus: "accepted",
                },
            ],
        })
            .populate("fromUserId", USER_SAFE_DATA)
            .populate("toUserId", USER_SAFE_DATA);
        const validConnections = yield Promise.all(connections.map((c) => __awaiter(void 0, void 0, void 0, function* () {
            const toUserId = JSON.parse(JSON.stringify(c.toUserId));
            const fromUserId = JSON.parse(JSON.stringify(c.fromUserId));
            if (fromUserId && loggedUserId === fromUserId._id) {
                const u = yield user_1.userModel.findById(toUserId);
                if (!Object.is(u, null)) {
                    return c.toUserId;
                }
            }
            else if (toUserId && loggedUserId === toUserId._id) {
                const u = yield user_1.userModel.findById(fromUserId);
                if (!Object.is(u, null)) {
                    return c.fromUserId;
                }
            }
            else {
                return;
            }
        })));
        const goodConnections = validConnections.filter((c) => c);
        res.json({ connections, goodConnections });
    }
    catch (err) {
        res.status(400).json({ error: "Something went wrong", err });
    }
}));
exports.userRouter.get("/requests/received", auth_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userEmail = req.body.email;
    try {
        const loggedUserId = req.body._id;
        const reqs = yield connectionRequest_1.connectionRequestModel
            .find({
            toUserId: loggedUserId,
            reqStatus: "interested",
        })
            .populate("fromUserId", USER_SAFE_DATA);
        const validReqs = yield Promise.all(reqs.map((r) => __awaiter(void 0, void 0, void 0, function* () {
            const fromUserId = JSON.parse(JSON.stringify(r.fromUserId));
            if (fromUserId) {
                const u = yield user_1.userModel.findById(r.fromUserId);
                if (u) {
                    return r;
                }
            }
        })));
        const goodReqs = validReqs.filter((r) => r);
        res.json({ reqs, goodReqs });
    }
    catch (err) {
        res.status(400).json({ error: "Something went wrong", err });
    }
}));
exports.userRouter.get("/feed", auth_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.body.user;
        const loggedUserId = req.body._id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        let hidePersons = new Set();
        const reqs = yield connectionRequest_1.connectionRequestModel
            .find({
            $or: [
                {
                    toUserId: loggedUserId,
                    $or: [{ reqStatus: "accepted" }, { reqStatus: "rejected" }],
                },
                {
                    fromUserId: loggedUserId,
                    $or: [
                        { reqStatus: "accepted" },
                        { reqStatus: "rejected" },
                        { reqStatus: "ignored" },
                    ],
                },
            ],
        })
            .select("fromUserId toUserId");
        reqs.forEach((r) => {
            if (r.fromUserId.toString() == loggedUserId) {
                hidePersons.add(r.toUserId);
            }
            else if (r.toUserId.toString() == loggedUserId) {
                hidePersons.add(r.fromUserId);
            }
        });
        const goodFeed = yield user_1.userModel.find({
            $and: [
                { _id: { $nin: Array.from(hidePersons) } },
                { _id: { $ne: loggedUserId } },
            ],
        }).select(USER_SAFE_DATA).skip((page - 1) * limit).limit(limit);
        res.json({ goodFeed });
    }
    catch (err) {
        res.status(400).json({ error: "Something went wrong", err });
    }
}));
