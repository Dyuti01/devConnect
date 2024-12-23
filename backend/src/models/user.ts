import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import validator from 'validator';
import bcrypt from 'bcrypt';

// export const genderSchema = new mongoose.Schema({
//   genType:{
//     type:String,
//     enum:['M, F']
//   }
// })

export interface IUser {
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  age: Number,
  gender: string,
  photoUrl: string,
  about:string,
  skills: string[],
}
interface IUserMethods {
  getJWT(): string;
  validatePassword(pass:string):boolean;
}

type UserModel = mongoose.Model<IUser, {}, IUserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
  firstName:{
    type:String,
    required:true,
    minLength:3,
    maxLength:50
  },
  lastName:{
    type:String
  },
  email:{
    type:String,
    lowercase: true,
    trim:true,
    required:true,
    unique:true,
    validate(value:any){
      if (!validator.isEmail(value)){
        throw new Error("Invalid email!")
      }
    }
  },
  password:{
    type:String,
    required:true,
    minLength:6
  },
  age:{
    type:Number,
    // min:18,
    validate(value:any){
      if (value < 18){
        throw new Error("You are underaged!")
      }
    }

  },
  gender:{
    type:String,
    enum:{
      values: ['M', 'F', "others"],
      message: `{VALUES} is incorrect gender!`
    }
  },
  photoUrl: {
    type:String,
    default: "https://res.cloudinary.com/dkfd0a8gd/image/upload/v1718284084/avatar_blxagy.gif"
  },
  about:{
    type:String,
    maxlength:200
  }
  ,
  skills:{
    type:[String],
  }
}, {timestamps:true});

userSchema.method('getJWT', async function () {
  const user = this;
  const token = await jwt.sign({_id:user._id}, "DEV@Tinder$790", { expiresIn: '1h' });

  return token;
})

userSchema.method('validatePassword', async function (pass:string) {
  const hash = this.password;
  const isPasswordValid = await bcrypt.compare(pass, hash);

  return isPasswordValid;
})

export const userModel = mongoose.model<IUser, UserModel>("User", userSchema);