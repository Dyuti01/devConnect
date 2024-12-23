import express from "express";
import { connectDB } from "./config/db";
import { userModel as User } from "./models/user";

import cookieParser from "cookie-parser";
import { userAuth } from "./middlewares/auth";
import { authRouter } from "./routes/auth";
import { profileRouter } from "./routes/profile";
import { connectionRequestRouter } from "./routes/request";
import { userRouter } from "./routes/user";

export const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/request", connectionRequestRouter);
app.use("/user", userRouter);

// The right process is first connect DB and then listen, otherwise requests will come with no connection to database

// Think about the case when your database is not connected and your app starts listening to api calls, it can cause problems

connectDB()
  .then(() => {
    console.log("Database connected successfully...");
    app.listen(7777, () => {
      console.log(`Server started at port ${7777}`);
    });
  })
  .catch((err) => {
    console.error("DB can't be connected...");
  });
