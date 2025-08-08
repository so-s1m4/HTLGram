import express from 'express'
import usersController from './users.controller'
import { ErrorWrapper } from '../../common/utils/utils.wrappers'
import JWTMiddleware from '../../common/middlewares/JWTMiddleware'
import { upload } from '../../common/multer/multer.photo'

const router = express.Router()

router.get('/', JWTMiddleware, ErrorWrapper(usersController.getUsersList))
router.post('/register', ErrorWrapper(usersController.register))
router.post('/login', ErrorWrapper(usersController.login))
router.get('/me', JWTMiddleware, ErrorWrapper(usersController.getMyData))
router.patch('/me', JWTMiddleware, upload.single('photo'), ErrorWrapper(usersController.updateMyData))
router.get('/me/friends', JWTMiddleware, ErrorWrapper(usersController.getFriends))
router.delete('/me/friends', JWTMiddleware, ErrorWrapper(usersController.deleteFriend))
router.post('/me/photos', JWTMiddleware, upload.single('photo'), ErrorWrapper(usersController.uploadMyPhoto))
router.delete('/me/photos/:photoPath', JWTMiddleware, ErrorWrapper(usersController.deleteMyPhoto))
router.get('/:userId', ErrorWrapper(usersController.getUserData))

export default router