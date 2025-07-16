import { Types } from "mongoose"
import { SpaceMemberModel, SpaceModel } from "./spaces.model"
import { SpaceRolesEnum, SpaceTypesEnum } from "./spaces.types"

const spacesService = {
    async createSpace(data: any, userId: Types.ObjectId) {
        const space = await SpaceModel.create({...data, owner: userId})
        const member = await SpaceMemberModel.create({space_id: space._id, user_id: userId, role: SpaceRolesEnum.ADMIN})
        return space
    },

    async getSpacesList(userId: Types.ObjectId) {
        const spaces = await SpaceMemberModel.find({user_id: userId}).populate("space_id").exec()
        return spaces
    },

    async updateSpace(data: any, spaceId: Types.ObjectId, userId: Types.ObjectId) {
        const space = await SpaceModel.findOneOrError({_id: spaceId})
        if (space.type === SpaceTypesEnum.POSTS) throw new Error("Not allowed")
        const member = await SpaceMemberModel.findOneOrError({space_id: spaceId, user_id: userId})
        if ((member).role !== SpaceRolesEnum.ADMIN) throw new Error("You are not admin")
        space.set(data)
        await space.save()
        return space.toObject()
    },

    async deleteSpace(spaceId: Types.ObjectId, userId: Types.ObjectId) {
        const space = await SpaceModel.findOneOrError({_id: spaceId})
        if (space.type === SpaceTypesEnum.POSTS) throw new Error("Not allowed")
        const member = await SpaceMemberModel.findOneOrError({space_id: spaceId, user_id: userId})
        if ((member).role !== SpaceRolesEnum.ADMIN) throw new Error("You are not admin")
        await SpaceMemberModel.deleteMany({ space_id: spaceId });
        await space.deleteOne()
        return { deleted: true }
    }
}

export default spacesService