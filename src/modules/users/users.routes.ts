import express from 'express'
import { deleteFriend, deleteMyPhoto, getFriends, getMyData, getUserData, getUsersData, patchUserData, postLoginUser, postMyPhoto, postRegisterUser } from './users.controller'
import { ErrorWrapper } from '../../common/utils/utils.wrappers'
import JWTMiddleware from '../../common/middlewares/JWTMiddleware'
import { upload } from '../../common/multer/multer.photo'

const router = express.Router()

router.get('/', ErrorWrapper(getUsersData))
router.post('/register', ErrorWrapper(postRegisterUser))
router.post('/login', ErrorWrapper(postLoginUser))
router.get('/me', JWTMiddleware, ErrorWrapper(getMyData))
router.patch('/me', JWTMiddleware, ErrorWrapper(patchUserData))
router.get('/me/friends', JWTMiddleware, ErrorWrapper(getFriends))
router.delete('/me/friends', JWTMiddleware, ErrorWrapper(deleteFriend))
router.post('/me/photos', JWTMiddleware, upload.single('photo'), ErrorWrapper(postMyPhoto))
router.delete('/me/photos/:photoPath', JWTMiddleware, ErrorWrapper(deleteMyPhoto))
router.get('/:username', ErrorWrapper(getUserData))

export default router