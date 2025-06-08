import {createUserSchema, loginUserSchema, updateUserSchema} from './users.validation'
import { createUser, loginUser, receiveUserData, updateUserData } from './users.service'
import {Request, Response, NextFunction} from 'express'
import { validationWrapper } from '../../common/utils/utils.wrappers'
import { ErrorWithStatus } from '../../common/middlewares/errorHandlerMiddleware'

export async function postRegisterUser(req: Request, res: Response, next: NextFunction) {
    const data = validationWrapper(createUserSchema, req.body || {})
    const user = await createUser(data)
    res.status(201).json({data: user})
}

export async function postLoginUser(req: Request, res: Response, next: NextFunction) {
    const data = validationWrapper(loginUserSchema, req.body || {})
    const token = await loginUser(data)
    res.status(200).json({token: token})
}

export async function getUserData(req: Request, res: Response, next: NextFunction) {
    const username = req.params['username']
    if (!username) throw new ErrorWithStatus(400, "'username' in params is missing")
    const user = await receiveUserData(username)
    res.status(200).json({data:user})
}

export async function patchUserData(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.user.userId
    const data = validationWrapper(updateUserSchema, req.body || {})
    const user = await updateUserData(userId, data)
    res.status(200).json({data:user})
}