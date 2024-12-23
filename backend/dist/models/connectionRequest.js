"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionRequestModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectionRequestSchema = new mongoose_1.default.Schema({
    fromUserId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    toUserId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, { timestamps: true });
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });
connectionRequestSchema.pre("save", function (next) {
    const connectionReq = this;
    const fromUserId = JSON.stringify(connectionReq.fromUserId);
    const toUserId = JSON.stringify(connectionReq.toUserId);
    if (fromUserId === toUserId) {
        throw new Error("Request yourself not allowed.");
    }
    next();
});
exports.connectionRequestModel = mongoose_1.default.model("connectionReq", connectionRequestSchema);
