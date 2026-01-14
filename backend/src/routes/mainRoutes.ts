import {Router} from 'express'
import authRouter from './authRoutes/auth.routes.js'
import userRouter from './userRoutes/user.routes.js'
import blogsRouter from './blogsRoutes/blogs.routes.js'

const mainRouter = Router()
mainRouter.use('/auth',authRouter)
mainRouter.use('/user',userRouter)
mainRouter.use('/blogs',blogsRouter)

export default mainRouter