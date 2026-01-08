import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { Response, Request } from "express";
import fs from 'fs'
import { IResponse } from "../../interfaces/responseInterface.js";
import IBlog from "../../interfaces/blogModelInterface.js";
import Blog from "../../models/blog.js";
import { Types } from "mongoose";
import cloudinary from "../../lib/cloudinary.js";
import path from "path";

type BlogData = Pick<IBlog, "title" | "content" | "banner" | "status">;

const window = new JSDOM().window;
const purify = DOMPurify(window);

const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, title, status } = req.body as BlogData;
    const bannerFile = req.file
    const userId = req.userId;
    
    if (!content || !title || !bannerFile || !status) {
      res
        .status(400)
        .json({
          success: false,
          message: "ALl field are required",
        } as IResponse);
      return;
    }
    if(!req.file){
        res.status(400).json({success:false,message:"No file uploaded"}as IResponse)
        return
    }
    const uploadPath = path.resolve(bannerFile.path)
    console.log("uploading...")
    const uploadResult = await cloudinary.uploader.upload(uploadPath,{
        folder:"blog_uploads"
    })
    console.log("upload",uploadResult.secure_url);
    
    
    fs.unlinkSync(bannerFile.path)
    
    const cleanContent = purify.sanitize(content);
    
    const newBlog = await Blog.create({
      title,
      content: cleanContent,
      banner:{
        publicId:uploadResult.public_id,
        url:uploadResult.secure_url,
        width:uploadResult.width,
        height:uploadResult.height,
      },
      status,
      author:new Types.ObjectId(userId)
    });
    
    res
      .status(201)
      .json({
        success: true,
        message: "new Blog create",
        data: newBlog,
      } as IResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "create blog error",
      error: error.message,
    } as IResponse);
  }
};



export { createBlog };
