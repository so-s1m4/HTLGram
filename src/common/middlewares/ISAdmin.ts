import { Request, Response, NextFunction } from 'express'
import { ErrorWithStatus } from './errorHandlerMiddleware'
import usersService from '../../modules/users/users.service'

const isAdminMiddleware = (req: Request, res: Response, next: NextFunction) => {
	try {
		const data = res.locals.user
		if (!data || typeof data === 'string') {
			throw new ErrorWithStatus(401, 'Invalid token')
		}
		usersService
			.getMyData(data.userId)
			.then(userData => {
				if (userData.role !== 'admin') {
					throw new ErrorWithStatus(403, 'Forbidden')
				}
				res.locals.userData = userData
				next()
			})
			.catch(err => {
				next(new ErrorWithStatus(401, err.message))
			})
	} catch (e: unknown) {
		const err = e instanceof Error ? e : new Error('Unexpected error')
		next(new ErrorWithStatus(401, err.message))
	}
}

export default isAdminMiddleware
