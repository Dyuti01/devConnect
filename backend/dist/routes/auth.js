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
exports.authRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const user_1 = require("../models/user");
const validation_1 = require("../utils/validation");
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.authRouter = express_1.default.Router();
exports.authRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, validation_1.validateSignUpData)(req);
        const { firstName, lastName, email, password } = req.body;
        const passwordHash = yield bcrypt_1.default.hash(password, 11);
        const user = new user_1.userModel({
            firstName,
            lastName,
            email,
            password: passwordHash,
        });
        yield user.save();
        res.json({ status: "User created" });
    }
    catch (err) {
        const message = err.message;
        res.status(400).json({ error: message });
    }
}));
exports.authRouter.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userEmail, password } = req.body;
        const user = yield user_1.userModel.findOne({ email: userEmail });
        if (!user) {
            res.status(404).json({ error: "Invalid credentials!" });
            return;
        }
        const isPasswordValid = yield user.validatePassword(password);
        if (isPasswordValid) {
            const token = yield user.getJWT();
            res.cookie("token", token, { maxAge: 24 * 3600000, path: "/", httpOnly: true, secure: true });
            res.json({ message: "Successfully logged in!" });
        }
        else {
            res.json({ message: "Invalid credentials!" });
        }
    }
    catch (err) {
        const message = err.message;
        res.status(400).json({ error: message });
    }
}));
exports.authRouter.post("/logout", auth_1.userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("token", { path: "/" })
            .json({ message: "Logout successfully!" });
    }
    catch (err) {
        const message = err.message;
        res.status(400).json({ error: message });
    }
}));
exports.authRouter.patch("/forgotPassword", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userEmail, oldPassword, newPassword } = req.body;
        const user = yield user_1.userModel.findOne({ email: userEmail });
        if (!user) {
            throw new Error("Invalid credentials!");
        }
        const hash = user.password;
        const isCorrectPassword = yield bcrypt_1.default.compare(oldPassword, hash);
        if (!isCorrectPassword) {
            throw new Error("Invalid credentials!");
        }
        const newHash = yield bcrypt_1.default.hash(newPassword, 11);
        yield user_1.userModel.findByIdAndUpdate(user._id, { password: newHash });
        res.json({ message: "Your password is changed successfully!" });
    }
    catch (err) {
        const message = err.message;
        res.status(400).json({ error: message });
    }
}));
