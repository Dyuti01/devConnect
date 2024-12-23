import mongoose from 'mongoose';

export const connectDB = async ()=>{
 await mongoose.connect(
  "mongodb://localhost:27015/db_rough"
);
}