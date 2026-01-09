import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { Response, Request } from "express";
import fs from "fs";
import { IResponse } from "../../interfaces/responseInterface.js";
import IBlog from "../../interfaces/blogModelInterface.js";
import Blog from "../../models/blog.js";
import User from "../../models/user.model.js";
import { QueryType } from "../../interfaces/blogController.js";
import { Types } from "mongoose";
import cloudinary from "../../lib/cloudinary.js";
import path from "path";

type BlogData = Pick<IBlog, "title" | "content" | "banner" | "status">;

const window = new JSDOM().window;
const purify = DOMPurify(window);

const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, title, status } = req.body as BlogData;
    const bannerFile = req.file;
    const userId = req.userId;

    if (!content || !title || !bannerFile || !status) {
      res.status(400).json({
        success: false,
        message: "ALl field are required",
      } as IResponse);
      return;
    }
    if (!req.file) {
      res
        .status(400)
        .json({ success: false, message: "No file uploaded" } as IResponse);
      return;
    }
    const uploadPath = path.resolve(bannerFile.path);
    const uploadResult = await cloudinary.uploader.upload(uploadPath, {
      folder: "blog_uploads",
    });

    fs.unlinkSync(bannerFile.path);

    const cleanContent = purify.sanitize(content);

    const newBlog = await Blog.create({
      title,
      content: cleanContent,
      banner: {
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
      },
      status,
      author: new Types.ObjectId(userId),
    });

    res.status(201).json({
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

const getAllBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const limit =
      parseInt(req.query.limit as string) ||
      Number(process.env.defaultResLimit);
    const offset =
      parseInt(req.query.offset as string) ||
      Number(process.env.defaultResOffset);
    const user = await User.findById(userId).select("role").lean().exec();
    const query: QueryType = {};

    if (user?.role === "user") {
      query.status = "published";
    }

    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .select("-banner.publicId -__v")
      .populate("author", "-createdAt -updatedAt -__v")
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.status(200).json({
      success: true,
      data: { limit, offset, total, blogs },
    } as IResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "internal get all blogs error",
      error: error.message,
    } as IResponse);
  }
};

const getBlogsByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.userId;
    const limit =
      parseInt(req.query.limit as string) ||
      Number(process.env.defaultResLimit);
    const offset =
      parseInt(req.query.offset as string) ||
      Number(process.env.defaultResOffset);
    const currentUser = await User.findById(currentUserId);
    const query: QueryType = {};

    if (currentUser?.role === "user") {
      query.status = "published";
    }
    const filter: any = { ...query };
    if (userId) {
      filter.author = new Types.ObjectId(userId);
    }

    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .select("-banner.publicId -__v")
      .populate("author", "-createdAt -updatedAt -__v")
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.status(200).json({
      success: false,
      data: { limit, offset, total, blogs },
    } as IResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "internal get blogs bys user error",
      error: error.message,
    } as IResponse);
  }
};

const getBlogBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const slug = req.params.slug!;
    const user = await User.findById(userId).select("role").lean().exec();
    const blog = await Blog.findOne({ slug })
      .select("-banner.publicId")
      .populate("author", "-createdAt -updatedAt -__v")
      .lean()
      .exec();
    if (!blog) {
      res
        .status(404)
        .json({ success: false, message: "Blog not found" } as IResponse);
      return;
    }
    if (user?.role === "user" && blog.status === "draft") {
      res.status(403).json({
        success: false,
        message: "Access denied, insufficient permission",
      } as IResponse);
      return;
    }
    res.status(200).json({ success: true, data: blog } as IResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "internal get blog by slug error",
      error: error.message,
    } as IResponse);
  }
};

const updateBlog = async (req: Request, res: Response): Promise<void> => {
  type BlogDataUpdate = Partial<
    Pick<IBlog, "title" | "content" | "banner" | "status">
  >;
  try {
    const { content, title, status } = req.body as BlogDataUpdate;
    const bannerFile: any = req.file;

    const userId = req.userId;
    const blogId = req.params.blogId;

    const user = await User.findById(userId).select("role").lean().exec();

    const blog = await Blog.findById(blogId).select("-__v").exec();
    if (!blog) {
      res.status(404).json({
        success: false,
        message: "Blog not found",
      } as IResponse);
      return;
    }
    if (blog.author.toString() !== userId && user?.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "You don't have permission",
      } as IResponse);
      return;
    }
    if (title) blog.title = title;
    if (content) {
      const cleanContent = purify.sanitize(content);
      blog.content = cleanContent;
    }
    if (status) blog.status = status;

    if (bannerFile) {
      const uploadPath = path.resolve(bannerFile.path);
      const uploadResult = await cloudinary.uploader.upload(uploadPath, {
        folder: "blog_uploads",
      });

      fs.unlinkSync(bannerFile.path);
      blog.banner = {
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
      };
    }

    await blog.save();
    res
      .status(200)
      .json({ success: true, message: "Blog update", data: blog } as IResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "internal update blog error",
      error: error.message,
    } as IResponse);
  }
};

const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;
  
  const blogId = req.params.blogId;
  const user = await User.findById(userId).select("role").lean().exec();
  const blog = await Blog.findById(blogId).select("-__v").exec();
  if (!blog) {
    res.status(404).json({
      success: false,
      message: "Blog not found",
    } as IResponse);
    return;
  }
   

  if (blog.author.toString() !== userId && user?.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "You don't have permission",
    } as IResponse);
    return;
  }
  await cloudinary.uploader.destroy(blog.banner.publicId)
  const blogDelete = await Blog.deleteOne({_id:blogId});
  res
    .status(200)
    .json({ success: true, message: "Blog delete successfully" } as IResponse);
};

export {
  createBlog,
  getAllBlogs,
  getBlogsByUser,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
};
