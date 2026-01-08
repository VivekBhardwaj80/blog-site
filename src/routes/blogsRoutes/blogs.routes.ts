import {Router} from 'express'
import isAuth from '../../middleware/auth.middleware.js'
import { createBlog } from '../../controllers/blogs.controller/blogs.controller.js'
import upload from '../../middleware/multer.js'


const blogsRouter = Router()
blogsRouter.post('/create',isAuth,upload.single("banner"),createBlog)

export default blogsRouter


