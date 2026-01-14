import { Router } from "express";
import isAuth from "../../middleware/auth.middleware.js";
import {
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
  deleteComment
} from "../../controllers/blogs.controller/blogs.controller.js";
import upload from "../../middleware/multer.js";

const blogsRouter = Router();
blogsRouter.post("/create", isAuth, upload.single("banner"), createBlog);
blogsRouter.get("/", isAuth, getAllBlogs);
blogsRouter.get("/user/:userId", isAuth, getBlogsByUser);
blogsRouter.get("/:slug", isAuth, getBlogBySlug);
blogsRouter.put("/:blogId", isAuth,upload.single("banner"), updateBlog);
blogsRouter.delete("/:blogId", isAuth, deleteBlog);
blogsRouter.post("/like/:blogId", isAuth, likeBlog);
blogsRouter.delete("/like/:blogId", isAuth, unlikeBlog);
blogsRouter.post("/comment/:blogId", isAuth, commentBlog);
blogsRouter.get("/comment/:blogId", isAuth, getCommentsByBlog);
blogsRouter.delete("/comment/:commentId", isAuth, deleteComment);

export default blogsRouter;
