import { Types } from "mongoose"
import { SpaceMemberModel, SpaceModel } from "./spaces.model"
import { BaseSpaceI, SpaceRolesEnum, SpaceTypesEnum } from "./spaces.types"
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware"

const spacesService = {
    async getSpacesList(userId: Types.ObjectId) {
        const spaces = await SpaceMemberModel.find({userId}).populate<{ spaceId: BaseSpaceI }>("spaceId").exec()
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
    }
}

export default spacesService