import { HydratedDocument, Types } from "mongoose"
import { SpaceMemberModel, SpaceModel } from "./spaces.model"
import { BaseSpaceI, ChatI, SpaceRolesEnum, SpaceTypesEnum } from "./spaces.types"
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware"
import { CommunicationModel } from "../../modules/communications/communication.model"
import { userModel } from "../../modules/users/users.model"

const spacesService = {
    async getSpacesList(userId: Types.ObjectId) {
        let spaces = await SpaceMemberModel.find({userId}).select("-_id -__v").populate<{ spaceId: BaseSpaceI }>("spaceId", " -__v").lean()
        for (let space of spaces) {
            if (space.spaceId.type === SpaceTypesEnum.CHAT) {
                const chat = space.spaceId as unknown as HydratedDocument<ChatI>
                // const members = await SpaceMemberModel.find({spaceId: space.spaceId._id}).select("-_id -__v").populate("userId", "-space_id").lean()
                // console.log(members)
                // const user = await userModel.findOne({_id: String(members[0]._id) === String(userId) ? members[1]._id : members[0]._id}).select("img username").lean()
                // if (!user) throw new ErrorWithStatus(404, "User not found")  
                // space.spaceId.title = user.username
                // space.spaceId.img = user.img

                const user = await userModel.findOne({_id: String(chat.user1_id) === String(userId) ? chat.user2_id : chat.user1_id}).select("img username").lean()
                if (!user) throw new ErrorWithStatus(404, "User not found")
                space.spaceId.title = user.username
                space.spaceId.img = user.img
                // space.spaceId.members = await SpaceMemberModel.find({spaceId: space.spaceId._id}).select("-_id -__v").populate("userId", "-space_id").lean()
                // space.spaceId.members = space.spaceId.members[0]._id === userId ? space.spaceId.members : space.spaceId.members.reverse()
            }
            space.spaceId.unreadmessages = 0
            space.spaceId.lastMessage = await CommunicationModel.findOne({spaceId: space.spaceId._id, isConfirmed: true}).sort({ createdAt: -1 }).lean()

        }
        return spaces
    },

    async deleteSpace(spaceId: Types.ObjectId, userId: Types.ObjectId) {
        const space = await SpaceModel.findById(spaceId)
        if (!space) throw new ErrorWithStatus(404, "Space not found")
        if (space.type === SpaceTypesEnum.POSTS) throw new Error("Not allowed")
        const member = await SpaceMemberModel.findOneOrError({spaceId, userId})
        if ((member).role !== SpaceRolesEnum.ADMIN) throw new Error("You are not admin")
        await SpaceMemberModel.deleteMany({ spaceId });
        await space.deleteOne()
        return { deleted: true }
    },

    async getInfo(spaceId: Types.ObjectId, userId: Types.ObjectId) {
        const member = await SpaceMemberModel.findOneOrError({spaceId, userId})
        const space = await SpaceModel.findById(spaceId).lean()
        if (!space) throw new ErrorWithStatus(404, "Space not found")
        if (space.type === SpaceTypesEnum.CHAT) {
            const chat = space as unknown as HydratedDocument<ChatI>
            const user = await userModel.findOne({_id: String(chat.user1_id) === String(userId) ? chat.user2_id : chat.user1_id}).select("img username").lean()
            if (!user) throw new ErrorWithStatus(404, "User not found")
            space.title = user.username
            space.img = user.img
            console.log(space)
        }
        return space
    }
}

export default spacesService