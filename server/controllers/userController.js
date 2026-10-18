import jwt from "jsonwebtoken";
import User from "../models/User.js";

import bcrypt from "bcrypt";
import Car from "../models/Car.js";


//generate JWT token
const generateToken=(userId)=>{
    const payload=userId;
    return jwt.sign(payload,process.env.JWT_SECRET)
}

export const registerUser=async(req,res)=>{
    try {
        const {name,email,password}=req.body;
        
        if(!name || !email || !password || password.length<8){
            return res.status(400).json({success:false ,message:"All fields are required and password must be at least 8 characters long"});
        }
        const userExists=await User.findOne({email})
        if(userExists){
            return res.status(400).json({success:false ,message:"User already exists"});
        }

        const hashedPassword=await bcrypt.hash(password,10);
        const user=await User.create({
            name,email,password:hashedPassword
        })
        const token=generateToken(user._id.toString());
        res.status(201).json({success:true ,message:"User registered successfully",data:token});
    } catch (error) {
        console.log(error,message);
        res.status(500).json({success:false ,message:"Server Error"});
        
    }
}

//login user
export const loginUser=async(req,res)=>{
    try {
        const {email,password}=req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success:false ,message:"User not found"});
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({success:false ,message:"Invalid credentials"});
        }
        const token = generateToken(user._id.toString());
        res.status(200).json({success:true ,token});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({success:false ,message:"Server Error"});
    }
}

//get user data using token

export const getUserData=async(req,res)=>{
    try {
        const {user} = req;
        res.status(200).json({success:true ,user});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({success:false ,message:"Server Error"});
    }
}

//get all cars for the frontend
export const getCars =async(req,res)=>{
    try {
        const cars =await Car.find({isAvailable:true});
        res.status(200).json({success:true ,cars});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({success:false ,message:"Server Error"});
    }
}