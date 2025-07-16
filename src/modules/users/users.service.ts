import {UserI, userModel} from "./users.model"
import bcrypt from 'bcryptjs'
import {config} from '../../config/config'
import {ErrorWithStatus} from '../../common/middlewares/errorHandlerMiddleware'
import jwt from 'jsonwebtoken'
import { Types } from "mongoose"
import deleteFile from "../../common/utils/utils.deleteFile"
import { friendModel } from "../friends/friends.model"
import { SpaceModel } from "../spaces/spaces.model"
import { SpaceTypesEnum } from "../spaces/spaces.types"

export async function receiveUsersData(data:any) {
    return await userModel.find({ username: new RegExp(`^${data.startsWith}`, 'i') } )
    .limit(data.limit)
    .skip(data.offSet)
    .exec()
}

export async function createUser(data: UserI): Promise<any> {
    const oldUser = await userModel.findOne({username:data.username}).exec()
    if (oldUser) throw new ErrorWithStatus(400, "User with such username already exist")
    data.password = await bcrypt.hash(data.password, config.PASSWORD_SALT)
    const user = await userModel.create(data)
    await SpaceModel.create({
        type: SpaceTypesEnum.POSTS,
        owner: user._id
    })
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
    const user = await userModel.findOneOrError({username})
    return user.toObject()
}

export async function receiveMyData(userId: Types.ObjectId) {
    const user = await userModel.findOneOrError({_id:userId})
    return user.toObject()
}

export async function updateUserData(userId: Types.ObjectId, data: any) {
    const user = await userModel.findOneOrError({_id: userId})
    if (data.password) data.password = await bcrypt.hash(data.password, config.PASSWORD_SALT)
    user.set(data)
    await user.save()
    return user.toObject()
}

export async function createMyPhoto(userId: Types.ObjectId, avatar: Express.Multer.File) {
    const user = await userModel.findOneOrError({_id:userId})
    user.img.push({path: avatar.filename, size: avatar.size})
    await user.save()
    return user.toObject()
}

export async function deleteMyPhotoByPath(userId: Types.ObjectId, photoPath: string) {
    const user = await userModel.findOneOrError({_id:userId})
    const idx = user.img.findIndex((p) => p.path === photoPath);
    if (idx === undefined || idx < 0) throw new ErrorWithStatus(404, 'Photo not found')
    user.img.splice(idx, 1);
    deleteFile(photoPath)
    await user.save()
    return user.toObject()
}

export async function receiveFriends(userId: Types.ObjectId) {
    const pairs = await friendModel.find({ $or: [{ user1_id: userId }, { user2_id: userId }] }).lean();
    const friendIds = pairs.map(p =>
        p.user1_id.equals(userId) ? p.user2_id : p.user1_id
    );

    const friends = await userModel.find({ _id: { $in: friendIds } }).select("img username name _id").lean();
    return friends
}

export async function deleteFriendByUsername(userId: Types.ObjectId, friendUsername: string) {
    const user1= await userModel.findOneOrError({_id:userId})
    const user2 = await userModel.findOneOrError({username:friendUsername})

    const friend = await friendModel.deleteOne({
        $or: [{user1_id: user1._id, user2_id: user2._id}, {user2_id: user1._id, user1_id: user2._id}]
    })

    user1.friendsCount -= 1
    await user1.save();
    user2.friendsCount -= 1
    await user2.save();
}