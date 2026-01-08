import {Router} from 'express'
import isAuth from '../../middleware/auth.middleware.js'
import { getCurrentUser, updateUser } from '../../controllers/user.controllers/user.controllers.js'

const userRouter = Router()
userRouter.get('/current-user',isAuth,getCurrentUser)
userRouter.put('/update',isAuth,updateUser)

export default userRouter

