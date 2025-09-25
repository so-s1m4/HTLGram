import express from 'express'
import usersController from './users.controller'
import { ErrorWrapper } from '../../common/utils/utils.wrappers'
import JWTMiddleware from '../../common/middlewares/JWTMiddleware'
import isAdminMiddleware from '../../common/middlewares/ISAdmin'

const router = express.Router()

router.get(
	'/',
	JWTMiddleware,
	isAdminMiddleware,
	ErrorWrapper(usersController.getUsersList)
)
router.post('/register', JWTMiddleware, isAdminMiddleware, ErrorWrapper(usersController.register))
router.post('/login', ErrorWrapper(usersController.login))

router.get('/me', JWTMiddleware, ErrorWrapper(usersController.getMyData))
router.patch('/me',JWTMiddleware,ErrorWrapper(usersController.updateMyData))

router.delete('/:id', JWTMiddleware, isAdminMiddleware, ErrorWrapper(usersController.deleteUser))
router.patch('/:id', JWTMiddleware, isAdminMiddleware, ErrorWrapper(usersController.updateUser))


export default router
