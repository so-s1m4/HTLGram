import {
	DeleteFriend,
	DeleteFriendSchema,
	GetUserDataDto,
	GetUserDataSchema,
	GetUsersListDto,
	GetUsersListSchema,
	LoginUserDto,
	LoginUserSchema,
	RegisterUserDto,
	RegisterUserSchema,
	UpdateMyDataDto,
	UpdateMyDataSchema,
} from './users.dto'
import { Request, Response, NextFunction } from 'express'
import { validationWrapper } from '../../common/utils/utils.wrappers'
import { ErrorWithStatus } from '../../common/middlewares/errorHandlerMiddleware'
import usersService from './users.service'
import {
	mapFriendsToPublic,
	mapUsersToPublic,
	toUserMe,
	toUserPublic,
} from './users.responses'
import { isUserOnline } from '../../socket/socket.utils'
import giftsService from '../gifts/gifts.service'
import { HydratedDocument, Types } from 'mongoose'
import { UserI } from './users.model'

type WithId = { _id: Types.ObjectId | string }

const usersController = {
	async getUsersList(req: Request, res: Response, next: NextFunction) {
		const userId = res.locals.user.userId
		const dto = validationWrapper<GetUsersListDto>(
			GetUsersListSchema,
			req.query || {}
		)
		const users = await usersService.getUsersList(dto, userId)
		res.status(200).json({ data: mapUsersToPublic(users) })
	},

	async register(req: Request, res: Response, next: NextFunction) {
		const dto = validationWrapper<RegisterUserDto>(
			RegisterUserSchema,
			req.body || {}
		)
		const token = await usersService.register(dto)
		res.status(201).json({ data: token })
	},

	async login(req: Request, res: Response, next: NextFunction) {
		const dto = validationWrapper<LoginUserDto>(LoginUserSchema, req.body || {})
		const token = await usersService.login(dto)
		res.status(200).json({ data: token })
	},

	async getMyData(req: Request, res: Response, next: NextFunction) {
		const userId = res.locals.user.userId
		const data:
			| (HydratedDocument<UserI> & { gifts?: any[] })
			| ((UserI & WithId) & { gifts?: any[] }) = await usersService.getMyData(
			userId
		)
		data.gifts = await giftsService.getOfUser(String(data._id))

		res.status(200).json({ data: toUserMe(data) })
	},

	async updateMyData(req: Request, res: Response, next: NextFunction) {
		const userId = res.locals.user.userId
		req.body = req.file
			? {
					...req.body,
					file: { filename: req.file.filename, size: req.file.size },
			  }
			: req.body || {}
		const dto = validationWrapper<UpdateMyDataDto>(UpdateMyDataSchema, req.body)
		const user = await usersService.updateMyData(userId, dto)
		res.status(200).json({ data: toUserMe(user) })
	},

	async getFriends(req: Request, res: Response, next: NextFunction) {
		const userId = res.locals.user.userId
		const data = await usersService.getFriends(userId)
		for (let friend of data) {
			if (isUserOnline(friend._id.toString())) {
				friend.isOnline = true
			} else {
				friend.isOnline = false
			}
		}
		res.status(200).json({ data: mapFriendsToPublic(data) })
	},

	async deleteFriend(req: Request, res: Response, next: NextFunction) {
		const userId = res.locals.user.userId
		const dto = validationWrapper<DeleteFriend>(
			DeleteFriendSchema,
			req.body || {}
		)
		await usersService.deleteFriend(userId, dto)
		res.status(204).end()
	},

	async uploadMyPhoto(req: Request, res: Response, next: NextFunction) {
		const userId = res.locals.user.userId
		if (!req.file) throw new ErrorWithStatus(400, 'Photo not found')
		const data = await usersService.uploadMyPhoto(userId, req.file)
		res.status(200).json({ data: toUserMe(data) })
	},

	async deleteMyPhoto(req: Request, res: Response, next: NextFunction) {
		const userId = res.locals.user.userId
		const img = req.params.photoPath
		if (!img) throw new ErrorWithStatus(400, 'Photo not found')
		const data = await usersService.deleteMyPhoto(userId, img)
		res.status(204).end()
	},

	async getUserData(req: Request, res: Response, next: NextFunction) {
		const dto = validationWrapper<GetUserDataDto>(
			GetUserDataSchema,
			req.params || {}
		)
		const user:
			| (HydratedDocument<UserI> & { gifts?: any[] })
			| ((UserI & WithId) & { gifts?: any[] }) = await usersService.getUserData(
			dto
		)
		user.gifts = await giftsService.getOfUser(String(user._id))
		res.status(200).json({ data: toUserPublic(user) })
	},
}

export default usersController
