import { Types } from "mongoose"
import { SpaceMemberModel, SpaceModel } from "./spaces.model"
import { BaseSpaceI, SpaceRolesEnum, SpaceTypesEnum } from "./spaces.types"
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware"

const spacesService = {
    async getSpacesList(userId: Types.ObjectId) {
        const spaces = await SpaceMemberModel.find({user_id: userId}).populate<{ space_id: BaseSpaceI }>("space_id").exec()
        return spaces
    },

    async deleteSpace(spaceId: Types.ObjectId, userId: Types.ObjectId) {
        const space = await SpaceModel.findOne({_id: spaceId})
        if (!space) throw new ErrorWithStatus(404, "Not found")
        if (space.type === SpaceTypesEnum.POSTS) throw new Error("Not allowed")
        const member = await SpaceMemberModel.findOneOrError({space_id: spaceId, user_id: userId})
        if ((member).role !== SpaceRolesEnum.ADMIN) throw new Error("You are not admin")
        await SpaceMemberModel.deleteMany({ space_id: spaceId });
        await space.deleteOne()
        return { deleted: true }
    }
}

export default spacesService