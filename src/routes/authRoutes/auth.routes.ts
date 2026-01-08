import {Router} from 'express'
import { login, logout, register } from '../../controllers/auth/auth.controller.js'
import isAuth from '../../middleware/auth.middleware.js'

const authRouter = Router()
authRouter.post('/register',register)
authRouter.post('/login',login)
authRouter.get('/logout',isAuth,logout)

export default authRouter