import express from 'express'
import adminController from './admin.controller'
import { ErrorWrapper } from '../../common/utils/utils.wrappers'
import JWTMiddleware from '../../common/middlewares/JWTMiddleware'
import { upload } from '../../common/multer/multer.photo'

const router = express.Router()

// Users
router.get('/users', JWTMiddleware, ErrorWrapper(adminController.users.getUsers))
router.post('/users', JWTMiddleware, ErrorWrapper(adminController.users.createUser))

router.get('/users/:userId', JWTMiddleware, ErrorWrapper(adminController.users.getUserById))
router.patch('/users/:userId', JWTMiddleware, ErrorWrapper(adminController.users.updateUserById))
router.delete('/users/:userId', JWTMiddleware, ErrorWrapper(adminController.users.deleteUserById))

router.get('/users/:userId/gifts', JWTMiddleware, ErrorWrapper(adminController.users.getUserGifts))
router.get('/users/:userId/gifts/:giftId', JWTMiddleware, ErrorWrapper(adminController.users.getUserGiftById))
router.patch('/users/:userId/gifts/:giftId', JWTMiddleware, ErrorWrapper(adminController.users.updateUserGiftById))
router.delete('/users/:userId/gifts/:giftId', JWTMiddleware, ErrorWrapper(adminController.users.deleteUserGiftById))

// Messages
router.get('/messages', JWTMiddleware, ErrorWrapper(adminController.messages.getMessages))
router.post('/messages', JWTMiddleware, ErrorWrapper(adminController.messages.createMessage))

router.get('/messages/:messageId', JWTMiddleware, ErrorWrapper(adminController.messages.getMessageById))
router.patch('/messages/:messageId', JWTMiddleware, ErrorWrapper(adminController.messages.updateMessageById))
router.delete('/messages/:messageId', JWTMiddleware, ErrorWrapper(adminController.messages.deleteMessageById))

// Gifts
router.get('/gifts', JWTMiddleware, ErrorWrapper(adminController.gifts.getGifts))
router.post('/gifts', JWTMiddleware, ErrorWrapper(adminController.gifts.createGift))
router.get('/gifts/:giftId', JWTMiddleware, ErrorWrapper(adminController.gifts.getGiftById))
router.patch('/gifts/:giftId', JWTMiddleware, ErrorWrapper(adminController.gifts.updateGiftById))
router.delete('/gifts/:giftId', JWTMiddleware, ErrorWrapper(adminController.gifts.deleteGiftById))

// Emojis
router.get('/emojis', JWTMiddleware, ErrorWrapper(adminController.emojis.getEmojis))
router.post('/emojis', JWTMiddleware, ErrorWrapper(adminController.emojis.createEmoji))
router.get('/emojis/:emojiId', JWTMiddleware, ErrorWrapper(adminController.emojis.getEmojiById))
router.patch('/emojis/:emojiId', JWTMiddleware, ErrorWrapper(adminController.emojis.updateEmojiById))
router.delete('/emojis/:emojiId', JWTMiddleware, ErrorWrapper(adminController.emojis.deleteEmojiById))


export default router
