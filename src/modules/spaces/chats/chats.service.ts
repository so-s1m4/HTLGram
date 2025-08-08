import { ErrorWithStatus } from "../../../common/middlewares/errorHandlerMiddleware"
import { friendModel } from "../../friends/friends.model"
import { HydratedDocument, Types } from "mongoose"
import { ChatModel, SpaceMemberModel } from "../spaces.model"
import { ChatI, SpaceRolesEnum, SpaceTypesEnum } from "../spaces.types"
import { ImageInfoI, UserI, UserModel } from "../../../modules/users/users.model"

export type ChatPublicResponse = {
    id: string,
    title: string,
    type: SpaceTypesEnum.CHAT,
    img: ImageInfoI[],
    updatedAt: Date,
    createdAt: Date,
}

export function toChatPublicResponse(
    chat: ChatI,
    user: {img: ImageInfoI[], username: string}
): ChatPublicResponse {
    return {
        id: chat._id.toString(),
        title: user.username,
        type: SpaceTypesEnum.CHAT,
        img: user.img,
        updatedAt: chat.updatedAt,
        createdAt: chat.createdAt
    }
}

const chatsService = {
    async createChat(user1_id: Types.ObjectId, user2_id: Types.ObjectId): 
        Promise<{
            chat: ChatPublicResponse,
            isNew: boolean
        }>
    {
        const areFriends = await friendModel.areFriends(user1_id, user2_id)
        if (!areFriends) throw new ErrorWithStatus(400, "You are not friends")
        const chat = await ChatModel.findOne({
            $or: [
                {user1_id, user2_id},
                {user1_id: user2_id, user2_id: user1_id}
            ]
        }).lean()
        if (chat) {
            const user = await UserModel.findOne({_id: String(chat.user1_id) === String(user1_id) ? chat.user2_id : chat.user1_id}).select<{img: ImageInfoI[], username: string}>("img username").exec()
            if (!user) throw new ErrorWithStatus(404, "User not found")
            return {chat: toChatPublicResponse(chat, user), isNew: false}
        } else {
            const newchat = await ChatModel.create({user1_id, user2_id})
            const user = await UserModel.findOne({_id: String(newchat.user1_id) === String(user1_id) ? newchat.user2_id : newchat.user1_id}).select<{img: ImageInfoI[], username: string}>("img username").exec()
            if (!user) throw new ErrorWithStatus(404, "User not found")
            await SpaceMemberModel.create({spaceId: newchat._id, userId: user1_id, role: SpaceRolesEnum.ADMIN})
            await SpaceMemberModel.create({spaceId: newchat._id, userId: user2_id, role: SpaceRolesEnum.ADMIN})
            return {chat: toChatPublicResponse(newchat, user), isNew: true}
        }
    }
}

export default chatsService