import express from 'express'
import adminController from './admin.controller'
import { ErrorWrapper } from '../../common/utils/utils.wrappers'
import JWTMiddleware from '../../common/middlewares/JWTMiddleware'
import ISAdmin from '../../common/middlewares/ISAdmin'
import { upload } from '../../common/multer/multer.photo'

const router = express.Router()

// Users
router.get('/users', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.users.getUsers))
router.post('/users', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.users.createUser))

router.get('/users/:userId', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.users.getUserById))
router.patch('/users/:userId', JWTMiddleware, ISAdmin, upload.single('img'), ErrorWrapper(adminController.users.updateUserById))
router.delete('/users/:userId', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.users.deleteUserById))

router.get('/users/:userId/gifts', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.users.getUserGifts))
router.get('/users/:userId/gifts/:giftId', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.users.getUserGiftById))
router.patch('/users/:userId/gifts/:giftId', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.users.updateUserGiftById))
router.delete('/users/:userId/gifts/:giftId', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.users.deleteUserGiftById))

// Messages
router.get('/messages', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.messages.getMessages))
router.post('/messages', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.messages.createMessage))

router.get('/messages/:messageId', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.messages.getMessageById))
router.patch('/messages/:messageId', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.messages.updateMessageById))
router.delete('/messages/:messageId', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.messages.deleteMessageById))

// Gifts
router.get('/gifts', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.gifts.getGifts))
router.post('/gifts', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.gifts.createGift))
router.get('/gifts/:giftId', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.gifts.getGiftById))
router.patch('/gifts/:giftId', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.gifts.updateGiftById))
router.delete('/gifts/:giftId', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.gifts.deleteGiftById))

// Emojis
router.get('/emojis', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.emojis.getEmojis))
router.post('/emojis', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.emojis.createEmoji))
router.get('/emojis/:emojiId', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.emojis.getEmojiById))
router.patch('/emojis/:emojiId', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.emojis.updateEmojiById))
router.delete('/emojis/:emojiId', JWTMiddleware, ISAdmin, ErrorWrapper(adminController.emojis.deleteEmojiById))


export default router
