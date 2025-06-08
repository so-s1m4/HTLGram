import express from 'express'
import { getUserData, patchUserData, postLoginUser, postRegisterUser } from './users.controller'
import { ErrorWrapper } from '../../common/utils/utils.wrappers'
import JWTMiddleware from '../../common/middlewares/JWTMiddleware'

const router = express.Router()

router.post('/register', ErrorWrapper(postRegisterUser))
router.post('/login', ErrorWrapper(postLoginUser))
router.get('/:username', ErrorWrapper(getUserData))
router.patch('/me', JWTMiddleware, ErrorWrapper(patchUserData))

export default router