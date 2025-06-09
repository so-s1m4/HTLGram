import {UserI, userModel} from "./users.model"
import bcrypt from 'bcryptjs'
import {config} from '../../config/config'
import {ErrorWithStatus} from '../../common/middlewares/errorHandlerMiddleware'
import jwt from 'jsonwebtoken'
import { findUser } from "./users.utils"
import { Types } from "mongoose"
import deleteFile from "../../common/utils/utils.deleteFile"

export async function createUser(data: UserI): Promise<any> {
    const oldUser = await userModel.findOne({username:data.username}).exec()
    if (oldUser) throw new ErrorWithStatus(400, "User with such username already exist")
    data.password = await bcrypt.hash(data.password, config.PASSWORD_SALT)
    const user = await userModel.create(data)
    const {password, ...userObject} = user.toObject()
    return userObject
}

export async function loginUser(data: any): Promise<string> {
    const oldUser = await userModel.findOne({username:data.username}).select('+password').exec()
    if (!oldUser) throw new ErrorWithStatus(400, "User was not found")
    if (!await bcrypt.compare(data.password, oldUser.password)) throw new ErrorWithStatus(400, "Password is false")
    return jwt.sign({userId: oldUser._id}, config.JWT_SECRET, {expiresIn: '7d'})
}

export async function receiveUserData(username: string): Promise<any> {
    const user = await findUser({username})
    return user.toObject()
}

export async function receiveMyData(userId: Types.ObjectId) {
    const user = await findUser({_id:userId})
    return user.toObject()
}

export async function updateUserData(userId: Types.ObjectId, data: any) {
    const user = await findUser({_id: userId})
    if (data.password) data.password = await bcrypt.hash(data.password, config.PASSWORD_SALT)
    user.set(data)
    await user.save()
    return user.toObject()
}

export async function deleteUserById(userId: Types.ObjectId) {
    await userModel.deleteOne({_id:userId})
}

export async function receiveMyPhotos(userId: Types.ObjectId) {
    const user = await findUser({_id:userId})
    return user.toObject().img
}

export async function createMyPhoto(userId: Types.ObjectId, avatar: Express.Multer.File) {
    const user = await findUser({_id:userId})
    if (user.storageUsed + avatar.size > 1024 * 1024 * 1024) throw new ErrorWithStatus(400, "Your cloude storage (1GB) is full")
    user.img!.push({path: avatar.filename, size: avatar.size})
    user.storageUsed += avatar.size
    await user.save()
    return user.toObject()
}

export async function deleteMyPhotoByPath(userId: Types.ObjectId, photoPath: string) {
    const user = await findUser({_id:userId})
    const idx = user.img?.findIndex((p) => p.path === photoPath);
    if (idx === undefined || idx < 0) throw new ErrorWithStatus(404, 'Photo not found')
    user.storageUsed -= user.img![idx].size
    user.img!.splice(idx, 1);
    deleteFile(photoPath)
    await user.save()
    return user.toObject()
}