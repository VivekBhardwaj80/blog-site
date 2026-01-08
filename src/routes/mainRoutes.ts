import {Router} from 'express'
import checkRouter from './check.js'
import authRouter from './authRoutes/auth.routes.js'
import userRouter from './userRoutes/user.routes.js'

const mainRouter = Router()
mainRouter.use('/check',checkRouter)
mainRouter.use('/auth',authRouter)
mainRouter.use('/user',userRouter)

export default mainRouter