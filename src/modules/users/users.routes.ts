import express from 'express'
import { getUserData, patchUserData, postLoginUser, postRegisterUser } from './users.controller'
import { ErrorWrapper } from '../../common/utils/utils.wrappers'
import JWTMiddleware from '../../common/middlewares/JWTMiddleware'
import { upload } from '../../common/multer/multer.photo'

const router = express.Router()

router.post('/register', upload.single('photo'), ErrorWrapper(postRegisterUser))
router.post('/login', ErrorWrapper(postLoginUser))
router.get('/:username', ErrorWrapper(getUserData))
router.patch('/me', upload.single('photo'), JWTMiddleware, ErrorWrapper(patchUserData))

export default router