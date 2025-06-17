import express from 'express'
import { getFriendRequests, patchFriendRequest, postFriendRequest } from './friends.controller'
import { ErrorWrapper } from '../../common/utils/utils.wrappers'
import JWTMiddleware from '../../common/middlewares/JWTMiddleware'

const router = express.Router()

router.post('/', JWTMiddleware, ErrorWrapper(postFriendRequest))
router.patch('/:requestId', JWTMiddleware, ErrorWrapper(patchFriendRequest))
router.get('/', JWTMiddleware, ErrorWrapper(getFriendRequests))
// router.delete('/:requestId')

export default router