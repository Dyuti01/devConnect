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
exports.profileRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const user_1 = require("../models/user");
const validation_1 = require("../utils/validation");
const connectionRequest_1 = require("../models/connectionRequest");
exports.profileRouter = express_1.default.Router();
exports.profileRouter.get("/view", auth_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, user } = req.body;
        res.json({ message: "Logged in userId : " + _id, user });
    }
    catch (err) {
        const message = err.message;
        res.status(400).json({ error: "Invalid credentials!", message });
    }
}));
exports.profileRouter.patch("/edit", auth_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.body._id;
        const dataObj = req.body.updateData;
        if (!(0, validation_1.validateProfileUpdateData)(req)) {
            throw new Error("Update not allowed!");
        }
        if (dataObj.skills.length > 10) {
            throw new Error("Can't add more than 10 skills...");
        }
        const user = yield user_1.userModel.findByIdAndUpdate(userId, dataObj, {
            returnDocument: "before",
            runValidators: true,
        });
        res.json({ msg: "Updated successfully..." });
    }
    catch (err) {
        res.status(400).json({ msg: "Something went wrong, " + err });
    }
}));
exports.profileRouter.delete("/erase", auth_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const loggedUserId = req.body._id;
    try {
        const user = yield user_1.userModel.findByIdAndDelete(loggedUserId);
        yield connectionRequest_1.connectionRequestModel.deleteMany({ fromUserId: loggedUserId });
        yield connectionRequest_1.connectionRequestModel.deleteMany({ toUserId: loggedUserId });
        res.json({ msg: "User deleted successfullly..." });
    }
    catch (err) {
        res.status(400).json({ error: "Something went wrong", err });
    }
}));
