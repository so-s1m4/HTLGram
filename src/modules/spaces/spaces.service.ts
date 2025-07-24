import { Types } from "mongoose"
import { SpaceMemberModel, SpaceModel } from "./spaces.model"
import { BaseSpaceI, SpaceRolesEnum, SpaceTypesEnum } from "./spaces.types"
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware"
import { CommunicationModel } from "../../modules/communications/communication.model"

const spacesService = {
    async getSpacesList(userId: Types.ObjectId) {
        let spaces = await SpaceMemberModel.find({userId}).select("-_id -__v").populate<{ spaceId: BaseSpaceI }>("spaceId", "-user1_id -user2_id -__v").lean()
        for (let space of spaces) {
            if (space.spaceId.type == "chat") {
                space.spaceId.members = await SpaceMemberModel.find({spaceId: space.spaceId._id}).select("-_id -__v").populate("userId", "-space_id").lean()
                space.spaceId.members = space.spaceId.members[0]._id === userId ? space.spaceId.members : space.spaceId.members.reverse()
            }
            space.spaceId.unreadmessages = 0
            space.spaceId.lastMessage = await CommunicationModel.find({spaceId: space.spaceId._id, isConfirmed: true}).skip(0).limit(1).lean()
        }
        return spaces
    },

    async deleteSpace(spaceId: Types.ObjectId, userId: Types.ObjectId) {
        const space = await SpaceModel.findById(spaceId)
        if (!space) throw new ErrorWithStatus(404, "Not found")
        if (space.type === SpaceTypesEnum.POSTS) throw new Error("Not allowed")
        const member = await SpaceMemberModel.findOneOrError({spaceId, userId})
        if ((member).role !== SpaceRolesEnum.ADMIN) throw new Error("You are not admin")
        await SpaceMemberModel.deleteMany({ spaceId });
        await space.deleteOne()
        return { deleted: true }
    },

    // async getInfo(spaceId: Types.ObjectId, userId: Types.ObjectId) {
    //     const member = await SpaceMemberModel.findOneOrError({spaceId, userId})
    //     const space = await SpaceModel.findById(spaceId)
    //     if (!space) throw new ErrorWithStatus(404, "Space not found")
    //     if (space.type === "chat") {

    //     }
    // }
}

export default spacesService