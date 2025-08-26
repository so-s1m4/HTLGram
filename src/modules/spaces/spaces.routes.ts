import express from 'express'
import { ErrorWrapper } from '../../common/utils/utils.wrappers'
import JWTMiddleware from '../../common/middlewares/JWTMiddleware'
import { upload } from '../../common/multer/multer.photo'
import spaceRestController from './spaces.rest.controller'

const router = express.Router()

router.patch('/:spaceId', JWTMiddleware, upload.single('photo'), ErrorWrapper(spaceRestController.updateSpaceData))
router.delete('/:spaceId/photos/:photoPath', JWTMiddleware, ErrorWrapper(spaceRestController.deleteSpacePhoto))

export default router