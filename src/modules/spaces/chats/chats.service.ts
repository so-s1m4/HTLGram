import { ErrorWithStatus } from "../../../common/middlewares/errorHandlerMiddleware"
import { friendModel } from "../../friends/friends.model"
import { Types } from "mongoose"
import { ChatModel, SpaceMemberModel } from "../spaces.model"
import { SpaceRolesEnum } from "../spaces.types"
import { UserModel } from "../../../modules/users/users.model"

const chatsService = {
    async createChat(user1_id: Types.ObjectId, user2_id: Types.ObjectId) {
        const areFriends = await friendModel.areFriends(user1_id, user2_id)
        if (!areFriends) throw new ErrorWithStatus(400, "You are not friends")
        const chat = await ChatModel.findOne({
            $or: [
                {user1_id, user2_id},
                {user1_id: user2_id, user2_id: user1_id}
            ]
        }).exec()
        if (chat) {
            const user = await UserModel.findOne({_id: String(chat.user1_id) === String(user1_id) ? chat.user2_id : chat.user1_id}).select("img username").lean()
            if (!user) throw new ErrorWithStatus(404, "User not found")
            chat.title = user.username
            chat.img = user.img
            return {chat, isNew: false}
            }
            else {
            const newchat = await ChatModel.create({user1_id, user2_id})
            const user = await UserModel.findOne({_id: String(newchat.user1_id) === String(user1_id) ? newchat.user2_id : newchat.user1_id}).select("img username").lean()
            if (!user) throw new ErrorWithStatus(404, "User not found")
            newchat.title = user.username
            newchat.img = user.img
            await SpaceMemberModel.create({spaceId: newchat._id, userId: user1_id, role: SpaceRolesEnum.ADMIN})
            await SpaceMemberModel.create({spaceId: newchat._id, userId: user2_id, role: SpaceRolesEnum.ADMIN})
            return {chat:newchat, isNew: true}
        }
    }
}

export default chatsService