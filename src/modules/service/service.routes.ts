import isAdminMiddleware from '../../common/middlewares/ISAdmin'
import JWTMiddleware from '../../common/middlewares/JWTMiddleware'
import express from 'express'
import serviceController from './service.controller'

const router = express.Router()

router.get('/', JWTMiddleware, serviceController.getServicesList)
router.post('/', JWTMiddleware, isAdminMiddleware, serviceController.createService)
router.get('/:id', JWTMiddleware, serviceController.getServiceById)
router.patch('/:id', JWTMiddleware, isAdminMiddleware, serviceController.updateServiceById)
router.delete('/:id', JWTMiddleware, isAdminMiddleware, serviceController.deleteServiceById)

export default router