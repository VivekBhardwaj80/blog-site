import {Router} from 'express'
import isAuth from '../../middleware/auth.middleware.js'
import { deleteCurrentUser, deleteUser, getAllUsers, getCurrentUser, getUser, updateUser } from '../../controllers/user.controllers/user.controllers.js'

const userRouter = Router()
userRouter.get('/current-user',isAuth,getCurrentUser)
userRouter.put('/update',isAuth,updateUser)
userRouter.delete('/delete',isAuth,deleteCurrentUser)
userRouter.delete('/delete/:userId',isAuth,deleteUser)
userRouter.get('/all-users',isAuth,getAllUsers)
userRouter.get('/all-users/:userId',isAuth,getUser)

export default userRouter

