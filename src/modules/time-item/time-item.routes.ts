import express from 'express'
import TimeItemController from './time-item.controller'
import JWTMiddleware from '../../common/middlewares/JWTMiddleware'
import isAdminMiddleware from '../../common/middlewares/ISAdmin'

const router = express.Router()

router.post('/', JWTMiddleware, isAdminMiddleware, TimeItemController.create)
router.get('/', JWTMiddleware, isAdminMiddleware, TimeItemController.getAll)
router.get('/my', JWTMiddleware, isAdminMiddleware, TimeItemController.getMy)

router.get('/:id', JWTMiddleware, isAdminMiddleware, TimeItemController.getById)
router.patch('/:id', JWTMiddleware, isAdminMiddleware, TimeItemController.update)
router.delete('/:id', JWTMiddleware, isAdminMiddleware, TimeItemController.delete)

export default router
