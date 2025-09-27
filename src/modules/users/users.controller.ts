import {
	GetUsersListDto,
	GetUsersListSchema,
	LoginUserDto,
	LoginUserSchema,
	RegisterUserDto,
	RegisterUserSchema,
	UpdateMyDataDto,
	UpdateMyDataSchema,
	UpdateUserDto,
	UpdateUserSchema,
	UpdateWorkDto,
	UpdateWorkSchema,
} from './users.dto'
import { Request, Response, NextFunction } from 'express'
import {
	ErrorWrapper,
	validationWrapper,
} from '../../common/utils/utils.wrappers'
import { ErrorWithStatus } from '../../common/middlewares/errorHandlerMiddleware'
import usersService from './users.service'
import { HydratedDocument, Types } from 'mongoose'
import { UserI } from './users.model'

type WithId = { _id: Types.ObjectId | string }

const toUserMe = (user: any) => {
	return {
		id: String(user._id),
		username: user.username,
		name: user.name,
		role: user.role,
		phone: user.phone,
		email: user.email,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	}
}

const withoutPassword = (user: any) => {
	const obj = user.toObject()
	delete obj.password
	delete obj.__v
	return obj
}

const usersController = {
	async login(req: Request, res: Response, next: NextFunction) {
		const dto = validationWrapper<LoginUserDto>(LoginUserSchema, req.body || {})
		const token = await usersService.login(dto)
		res.status(200).json({ data: token })
	},

	async getUsersList(req: Request, res: Response, next: NextFunction) {
		const userId = res.locals.user.userId
		const dto = validationWrapper<GetUsersListDto>(
			GetUsersListSchema,
			req.query || {}
		)
		const users = await usersService.getUsersList(dto, userId)
		res.status(200).json({ data: users.map(withoutPassword).map(toUserMe) })
	},
	async register(req: Request, res: Response, next: NextFunction) {
		const dto = validationWrapper<RegisterUserDto>(
			RegisterUserSchema,
			req.body || {}
		)
		const token = await usersService.register(dto)
		res.status(201).json({ data: token })
	},

	async getMyData(req: Request, res: Response, next: NextFunction) {
		const userId = res.locals.user.userId
		let data: (HydratedDocument<UserI> | (UserI & WithId)) & {
			password?: string
		} = await usersService.getMyData(userId)

		console.log(data.password)

		res.status(200).json({ data: toUserMe(data) })
	},
	async updateMyData(req: Request, res: Response, next: NextFunction) {
		const userId = res.locals.user.userId
		const dto = validationWrapper<UpdateMyDataDto>(
			UpdateMyDataSchema,
			req.body || {}
		)
		const user = await usersService.updateMyData(userId, dto)
		res.status(200).json({ data: toUserMe(user) })
	},

	async deleteUser(req: Request, res: Response, next: NextFunction) {
		const userId = req.params.id
		if (!userId || !Types.ObjectId.isValid(userId))
			throw new ErrorWithStatus(400, 'User id is not valid')
		await usersService.deleteUser(new Types.ObjectId(userId))
		res.status(200).json({ data: 'User was deleted' })
	},
	async updateUser(req: Request, res: Response, next: NextFunction) {
		const userId = req.params.id
		if (!userId || !Types.ObjectId.isValid(userId))
			throw new ErrorWithStatus(400, 'User id is not valid')
		const dto = validationWrapper<UpdateUserDto>(
			UpdateUserSchema,
			req.body || {}
		)
		await usersService.updateUser(new Types.ObjectId(userId), dto)
		res.status(200).json({ data: 'User was updated' })
	},
	async updateWork(req: Request, res: Response, next: NextFunction) {
		const userId = req.params.id

		const data = validationWrapper<UpdateWorkDto>(UpdateWorkSchema, req.body)

		console.log(data)
		if (!data.timeStart || !data.timeEnd || data.timeStart === data.timeEnd) {
			await usersService.deleteWork(userId, data.date)
		} else {
			await usersService.updateWork(userId, data)
		}
		res.status(200).json({ data: 'User work time was updated' })
	},
}

export default usersController
