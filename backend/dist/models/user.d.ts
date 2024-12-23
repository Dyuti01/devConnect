import mongoose from "mongoose";
export interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    age: Number;
    gender: string;
    photoUrl: string;
    about: string;
    skills: string[];
}
interface IUserMethods {
    getJWT(): string;
    validatePassword(pass: string): boolean;
}
type UserModel = mongoose.Model<IUser, {}, IUserMethods>;
export declare const userModel: UserModel;
export {};
