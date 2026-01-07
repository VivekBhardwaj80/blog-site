import {Router} from 'express'
import checkRouter from './check.js'
import authRouter from './authRoutes/auth.routes.js'

const mainRouter = Router()
mainRouter.use('/check',checkRouter)
mainRouter.use('/auth',authRouter)

export default mainRouter