import {createUserSchema, loginUserSchema, receiveUsersSchema, updateUserSchema} from './users.validation'
import { createMyPhoto, createUser, deleteFriendByUsername, deleteMyPhotoByPath, deleteUserById, loginUser, receiveFriends, receiveMyData, receiveUserData, receiveUsersData, updateUserData } from './users.service'
import {Request, Response, NextFunction} from 'express'
import { validationWrapper } from '../../common/utils/utils.wrappers'
import { ErrorWithStatus } from '../../common/middlewares/errorHandlerMiddleware'

export async function getUsersData(req: Request, res: Response, next: NextFunction) {
    const data = validationWrapper(receiveUsersSchema, req.query || {})
    const users = await receiveUsersData(data)
    res.status(201).json({data: users})
}

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

export async function getMyData(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.user.userId
    const data = await receiveMyData(userId)
    res.status(200).json({data})
}

export async function patchUserData(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.user.userId
    const data = validationWrapper(updateUserSchema, req.body || {})
    const user = await updateUserData(userId, data)
    res.status(200).json({data:user})
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.user.userId
    await deleteUserById(userId)
    res.status(200).end()
}


export async function postMyPhoto(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.user.userId
    if (!req.file) throw new ErrorWithStatus(400, "Photo not found")
    const data = await createMyPhoto(userId, req.file)
    res.status(200).json({data})
}

export async function deleteMyPhoto(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.user.userId
    const img = req.params.photoPath
    if (!img) throw new ErrorWithStatus(400, "Photo not found")
    const data = await deleteMyPhotoByPath(userId, img)
    res.status(200).json({data})
}


export async function getFriends(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.user.userId
    const data = await receiveFriends(userId)
    res.status(200).json({data})
}

export async function deleteFriend(req: Request, res: Response, next: NextFunction) {
    const userId = res.locals.user.userId
    const friendUsername = req.body.username
    if (!friendUsername) throw new ErrorWithStatus(400, "friendUsername is required")
    await deleteFriendByUsername(userId, friendUsername)
    res.status(200)
}