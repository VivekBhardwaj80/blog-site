import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import { IResponse } from '../interfaces/responseInterface.js'

interface jwtPayload{
    id:string;
    role:string;
}


const isAuth = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ","");
        if(!token){
            res.status(401).json({success:false,message:"Unauthorized User"}as IResponse)
            return
        }
        if(!process.env.JWT_SECRET){
            throw new Error("jwt Secret not define")
        }
        const verifyToken = jwt.verify(token,process.env.JWT_SECRET) as jwtPayload
        req.id = verifyToken.id
        req.role=verifyToken.role
        next()
    } catch (error:any) {
        console.log("auth error",error.message);
        
        res.status(401).json({success:true,message:"Invalid or expire token"}as IResponse)
    }
}

export default isAuth