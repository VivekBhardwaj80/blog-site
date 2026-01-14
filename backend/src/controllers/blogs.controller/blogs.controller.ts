import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { Response, Request } from "express";
import fs from "fs";
import path from "path";

// interface
import { IResponse } from "../../interfaces/responseInterface.js";
import IBlog from "../../interfaces/blogModelInterface.js";
import { QueryType } from "../../interfaces/blogController.js";
import IComment from "../../interfaces/commentModel.js";

// model
import Blog from "../../models/blog.js";
import User from "../../models/user.model.js";
import Like from "../../models/like.js";
import Comment from "../../models/comment.js";

// other
import { Types } from "mongoose";
import cloudinary from "../../lib/cloudinary.js";
import comment from "../../models/comment.js";

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
  try {
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
    await cloudinary.uploader.destroy(blog.banner.publicId);
    const blogDelete = await Blog.deleteOne({ _id: blogId });
    res.status(200).json({
      success: true,
      message: "Blog delete successfully",
    } as IResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "internal Blog delete error",
      error: error.message,
    } as IResponse);
  }
};

const likeBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;
    const userId = req.userId;
    if (!blogId || !userId) {
      res.status(400).json({
        success: false,
        message: "invalid user or blog ID",
      } as IResponse);
      return;
    }
    const blog = await Blog.findById(blogId).select("likesCount").exec();
    if (!blog) {
      res.status(400).json({
        success: false,
        message: "blog not found",
      } as IResponse);
      return;
    }
    const existingLike = await Like.findOne({ userId, blogId });
    if (existingLike) {
      res.status(400).json({
        success: false,
        message: "You already like this blog",
      } as IResponse);
      return;
    }
    await Like.create({ blogId, userId });
    blog.likesCount++;
    await blog.save();

    res.status(201).json({
      success: true,
      message: "liked",
      data: blog.likesCount,
    } as IResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "internal like Blog error",
      error: error.message,
    } as IResponse);
  }
};

const unlikeBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;
    const userId = req.userId;
    if (!blogId || !userId) {
      res.status(400).json({
        success: false,
        message: "invalid user or blog ID",
      } as IResponse);
      return;
    }
    const existingLike = await Like.findOne({ blogId, userId });
    if (!existingLike) {
      res
        .status(404)
        .json({ success: false, message: "Like not found" } as IResponse);
      return;
    }
    await Like.findOneAndDelete({ _id: existingLike._id });
    const blog = await Blog.findById(blogId).select("likesCount").exec();
    if (!blog) {
      res
        .status(404)
        .json({ success: false, message: "Blog not found" } as IResponse);
      return;
    }
    blog.likesCount--;
    await blog.save();
    res
      .status(200)
      .json({ success: true, message: "Unlike Blog" } as IResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "internal like Blog error",
      error: error.message,
    } as IResponse);
  }
};
const commentBlog = async (req: Request, res: Response): Promise<void> => {
  type CommentData = Pick<IComment, "content">;
  try {
    const { blogId } = req.params;
    const { content } = req.body as CommentData;
    const userId = req.userId;
    if (!blogId || !userId || !content) {
      res.status(400).json({
        success: false,
        message: "invalid user or blog or ID and content",
      } as IResponse);
      return;
    }
    const blog = await Blog.findById(blogId).select("_id commentsCount").exec();
    if (!blog) {
      res
        .status(404)
        .json({ success: false, message: "Blog not found" } as IResponse);
      return;
    }
    const cleanComment = purify.sanitize(content);
    const newComment = await Comment.create({
      blogId,
      content: cleanComment,
      userId,
    });
    blog.commentsCount++;
    await blog.save();

    res.status(200).json({
      success: true,
      message: "Blog Commented",
      data: newComment.content,
    } as IResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "internal comment Blog error",
      error: error.message,
    } as IResponse);
  }
};

const getCommentsByBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { blogId } = req.params;
    if (!blogId) {
      res
        .status(400)
        .json({ success: false, message: "invalid blog ID" } as IResponse);
      return;
    }
    const blog = await Blog.findById(blogId).select("_id").lean().exec();
    if (!blog) {
      res
        .status(404)
        .json({ success: false, message: "Blog not found" } as IResponse);
      return;
    }
    const allComments = await Comment.find({ blogId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    if (allComments.length === 0) {
      res.status(400).json({
        success: false,
        message: "Comment not found for this blog",
      } as IResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Blog Commented",
      data: allComments,
    } as IResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "internal get Comment By Blog error",
      error: error.message,
    } as IResponse);
  }
};

const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;
    if (!commentId || !userId) {
      res.status(400).json({
        success: false,
        message: "invalid Comment or user ID",
      } as IResponse);
      return;
    }
    const comments = await Comment.findById(commentId)
      .select("userId blogId")
      .exec();
    if (!comments) {
      res
        .status(400)
        .json({ success: false, message: "Comment not found" } as IResponse);
      return;
    }
    const user = await User.findById(userId).select("role").exec();
    if (!user) {
      res
        .status(400)
        .json({ success: false, message: "User not found" } as IResponse);
      return;
    }
    const blog = await Blog.findById(comments.blogId)
      .select("commentsCount")
      .exec();
    if (!blog) {
      res
        .status(400)
        .json({ success: false, message: "Blog not found" } as IResponse);
      return;
    }
    if (comments.userId.toString() !== userId && user?.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "You don't have permission",
      } as IResponse);
      return;
    }
    await Comment.deleteOne({ _id: commentId });
    blog.commentsCount--;
    blog.save();
    res
      .status(200)
      .json({ success: true, message: "Delete Comment" } as IResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "internal get Comment By Blog error",
      error: error.message,
    } as IResponse);
  }
};
export {
  createBlog,
  getAllBlogs,
  getBlogsByUser,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  likeBlog,
  unlikeBlog,
  commentBlog,
  getCommentsByBlog,
  deleteComment,
};
