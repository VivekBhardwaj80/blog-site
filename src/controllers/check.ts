import {Response, Request} from 'express'
import { IResponse } from '../interfaces/responseInterface.js'
const check = async(req:Request,res:Response)=>{
    try {
        res.status(200).json({success:true, message:"server get ur req", data:null}as IResponse)
    } catch (error:any) {
        console.log(error.message);
        res.status(500).json({success:false, message:"check error",data:null} as IResponse)
    }
}

export {check}