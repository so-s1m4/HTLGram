import { Request, Response, NextFunction } from 'express'
import usersService from '../users/users.service'
import adminService from './admin.service'
import { ObjectId } from 'mongoose'
import { config } from '../../config/config'
import bcrypt from 'bcryptjs'
import { create } from 'domain'

const adminController = {
	users: {
		getUsers: async (req: Request, res: Response, next: NextFunction) => {
			const users = await adminService.users.getUsersList()
			res.status(200).json({ data: users })
		},
		createUser: async (req: Request, res: Response, next: NextFunction) => {
			const user = await adminService.users.createUser(req.body)
			res.status(201).json({ data: user })
		},
		getUserById: async (req: Request, res: Response, next: NextFunction) => {
			const user = await adminService.users.getUserById(req.params.userId)
			res.status(200).json({ data: user })
		},
		updateUserById: async (req: Request, res: Response, next: NextFunction) => {
			const userId: any = req.params.userId
			delete req.body.img
			delete req.body._id
			delete req.body.__v
			delete req.body.updatedAt
			delete req.body.createdAt
			delete req.body.friendsCount
			if (req.body.password) req.body.password = await bcrypt.hash(req.body.password, config.PASSWORD_SALT);


			const user = await adminService.users.updateUserById(
				userId,
				req.body
			)
			if (req.file) {
				await usersService.uploadMyPhoto(userId, req.file)
			}
			res.status(200).json({ data: user })
		},
		deleteUserById: async (req: Request, res: Response, next: NextFunction) => {
			const user = await adminService.users.deleteUserById(req.params.userId)
			res.status(200).json({ data: user })
		},
		createUserGift: async (req: Request, res: Response, next: NextFunction) => {
			const user = await adminService.users.createUserGift(
				req.params.userId,
				req.body
			)
			res.status(201).json({ data: user })
		},
		getUserGifts: async (req: Request, res: Response, next: NextFunction) => {
			const user = await adminService.users.getUserGifts(req.params.userId)
			res.status(200).json({ data: user })
		},
		getUserGiftById: async (
			req: Request,
			res: Response,
			next: NextFunction
		) => {
			const user = await adminService.users.getUserGiftsById(
				req.params.userId,
				req.params.giftId
			)
			res.status(200).json({ data: user })
		},
		updateUserGiftById: async (
			req: Request,
			res: Response,
			next: NextFunction
		) => {
			const user = await adminService.users.updateUserGiftById(
				req.params.userId,
				req.params.giftId,
				req.body
			)
			res.status(200).json({ data: user })
		},
		deleteUserGiftById: async (
			req: Request,
			res: Response,
			next: NextFunction
		) => {
			const user = await adminService.users.deleteUserGiftById(
				req.params.userId,
				req.params.giftId
			)
			res.status(200).json({ data: user })
		},
	},
	messages: {
		getMessages: async (req: Request, res: Response, next: NextFunction) => {
			const messages = await adminService.messages.getMessages()
			res.status(200).json({ data: messages })
		},
		createMessage: async (req: Request, res: Response, next: NextFunction) => {
			const message = await adminService.messages.createMessage(req.body)
			res.status(201).json({ data: message })
		},
		getMessageById: async (req: Request, res: Response, next: NextFunction) => {
			const message = await adminService.messages.getMessageById(
				req.params.messageId
			)
			res.status(200).json({ data: message })
		},
		updateMessageById: async (
			req: Request,
			res: Response,
			next: NextFunction
		) => {
			const message = await adminService.messages.updateMessageById(
				req.params.messageId,
				req.body
			)
			res.status(200).json({ data: message })
		},
		deleteMessageById: async (
			req: Request,
			res: Response,
			next: NextFunction
		) => {
			const message = await adminService.messages.deleteMessageById(
				req.params.messageId
			)
			res.status(200).json({ data: message })
		},
	},
	gifts: {
		getGifts: async (req: Request, res: Response, next: NextFunction) => {
			const gifts = await adminService.gifts.getGifts()
			res.status(200).json({ data: gifts })
		},
		createGift: async (req: Request, res: Response, next: NextFunction) => {
			const gift = await adminService.gifts.createGift(req.body)
			res.status(201).json({ data: gift })
		},
		getGiftById: async (req: Request, res: Response, next: NextFunction) => {
			const gift = await adminService.gifts.getGiftById(req.params.giftId)
			res.status(200).json({ data: gift })
		},
		updateGiftById: async (req: Request, res: Response, next: NextFunction) => {
			const gift = await adminService.gifts.updateGiftById(
				req.params.giftId,
				req.body
			)
			res.status(200).json({ data: gift })
		},
		deleteGiftById: async (req: Request, res: Response, next: NextFunction) => {
			const gift = await adminService.gifts.deleteGiftById(req.params.giftId)
			res.status(200).json({ data: gift })
		},
	},
	emojis: {
		getEmojis: async (req: Request, res: Response, next: NextFunction) => {
			const emojis = await adminService.emojis.getEmojis()
			res.status(200).json({ data: emojis })
		},
		createEmoji: async (req: Request, res: Response, next: NextFunction) => {
			const emoji = await adminService.emojis.createEmoji(req.body)
			res.status(201).json({ data: emoji })
		},
		getEmojiById: async (req: Request, res: Response, next: NextFunction) => {
			const emoji = await adminService.emojis.getEmojiById(req.params.emojiId)
			res.status(200).json({ data: emoji })
		},
		updateEmojiById: async (
			req: Request,
			res: Response,
			next: NextFunction
		) => {
			const emoji = await adminService.emojis.updateEmojiById(
				req.params.emojiId,
				req.body
			)
			res.status(200).json({ data: emoji })
		},
		deleteEmojiById: async (
			req: Request,
			res: Response,
			next: NextFunction
		) => {
			const emoji = await adminService.emojis.deleteEmojiById(
				req.params.emojiId
			)
			res.status(200).json({ data: emoji })
		},
	},
}

export default adminController
