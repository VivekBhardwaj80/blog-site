import jwt from 'jsonwebtoken'

import {Types} from 'mongoose'

const generateToken = (userId:Types.ObjectId):string|undefined=>{
    try {
        if(!process.env.JWT_SECRET){
            throw new Error("JWT secret is not define")
        }
        return jwt.sign({userId},process.env.JWT_SECRET!,{
            expiresIn:"1d",
        })
    } catch (error:any) {
        console.log("JWT generation failed",error.message);
    }
}
export default generateToken