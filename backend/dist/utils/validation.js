"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProfileUpdateData = exports.validateSignUpData = void 0;
const validator_1 = __importDefault(require("validator"));
const validateSignUpData = (req) => {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName) {
        throw new Error("Name is not valid!");
    }
    else if (firstName.length < 4 || firstName.length > 50) {
        throw new Error("firstName should be 4 to 50 characters! ");
    }
    if (!validator_1.default.isEmail(email)) {
        throw new Error("Email is not valid!");
    }
    if (!validator_1.default.isStrongPassword(password)) {
        throw new Error("Enter strong password!");
    }
};
exports.validateSignUpData = validateSignUpData;
const validateProfileUpdateData = (req) => {
    const data = req.body.updateData;
    const allowedFields = ["firstName", "lastName", "gender", "skills", "photoUrl", "about"];
    const isUpdateAllowed = Object.keys(data).every((k) => allowedFields.includes(k));
    return isUpdateAllowed;
};
exports.validateProfileUpdateData = validateProfileUpdateData;
