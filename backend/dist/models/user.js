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
exports.userModel = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        required: true,
        unique: true,
        validate(value) {
            if (!validator_1.default.isEmail(value)) {
                throw new Error("Invalid email!");
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    age: {
        type: Number,
        validate(value) {
            if (value < 18) {
                throw new Error("You are underaged!");
            }
        }
    },
    gender: {
        type: String,
        enum: {
            values: ['M', 'F', "others"],
            message: `{VALUES} is incorrect gender!`
        }
    },
    photoUrl: {
        type: String,
        default: "https://res.cloudinary.com/dkfd0a8gd/image/upload/v1718284084/avatar_blxagy.gif"
    },
    about: {
        type: String,
        maxlength: 200
    },
    skills: {
        type: [String],
    }
}, { timestamps: true });
userSchema.method('getJWT', function () {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const token = yield jsonwebtoken_1.default.sign({ _id: user._id }, "DEV@Tinder$790", { expiresIn: '1h' });
        return token;
    });
});
userSchema.method('validatePassword', function (pass) {
    return __awaiter(this, void 0, void 0, function* () {
        const hash = this.password;
        const isPasswordValid = yield bcrypt_1.default.compare(pass, hash);
        return isPasswordValid;
    });
});
exports.userModel = mongoose_1.default.model("User", userSchema);
