"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const db_1 = require("./config/db");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = require("./routes/auth");
const profile_1 = require("./routes/profile");
const request_1 = require("./routes/request");
const user_1 = require("./routes/user");
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use((0, cookie_parser_1.default)());
exports.app.use("/auth", auth_1.authRouter);
exports.app.use("/profile", profile_1.profileRouter);
exports.app.use("/request", request_1.connectionRequestRouter);
exports.app.use("/user", user_1.userRouter);
(0, db_1.connectDB)()
    .then(() => {
    console.log("Database connected successfully...");
    exports.app.listen(7777, () => {
        console.log(`Server started at port ${7777}`);
    });
})
    .catch((err) => {
    console.error("DB can't be connected...");
});
