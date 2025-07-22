import { ErrorWithStatus } from "../../../common/middlewares/errorHandlerMiddleware"
import { friendModel } from "../../friends/friends.model"
import { Types } from "mongoose"
import { ChatModel, SpaceMemberModel } from "../spaces.model"
import { SpaceRolesEnum } from "../spaces.types"

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
        if (chat) return {chat, isNew: false}
        else {
            const newchat = await ChatModel.create({user1_id, user2_id})
            await SpaceMemberModel.create({space_id: newchat._id, user_id: user1_id, role: SpaceRolesEnum.ADMIN})
            await SpaceMemberModel.create({space_id: newchat._id, user_id: user2_id, role: SpaceRolesEnum.ADMIN})
            return {chat:newchat, isNew: true}
        }
    }
}

export default chatsService