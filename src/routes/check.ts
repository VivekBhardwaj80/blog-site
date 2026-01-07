import {Router} from 'express'
import { check } from '../controllers/check.js'

const checkRouter = Router()
checkRouter.get('/',check)

export default checkRouter