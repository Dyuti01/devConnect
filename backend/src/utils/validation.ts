import express, { Request, Response } from 'express';
import validator from 'validator'

export const validateSignUpData = (req:Request) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName){
    throw new Error("Name is not valid!");
  }
  else if (firstName.length < 4 || firstName.length > 50){
    throw new Error("firstName should be 4 to 50 characters! ")
  }

  if (!validator.isEmail(email)){
    throw new Error("Email is not valid!");
  }
  

  if (!validator.isStrongPassword(password)){
    throw new Error("Enter strong password!")
  }
}

export const validateProfileUpdateData = (req:Request):boolean=>{
  const data = req.body.updateData;
  const allowedFields = ["firstName", "lastName", "gender", "skills", "photoUrl", "about"];

  const isUpdateAllowed = Object.keys(data).every((k) =>
    allowedFields.includes(k)
  );

  return isUpdateAllowed;
}