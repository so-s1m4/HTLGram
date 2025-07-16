import { Types } from "mongoose"
import { SpaceMemberModel, SpaceModel } from "./spaces.model"
import { SpaceRolesEnum } from "./spaces.types"

const spacesService = {
    async createSpace(data: any, userId: Types.ObjectId) {
        const space = await SpaceModel.create({...data, owner: userId})
        const member = await SpaceMemberModel.create({space_id: space._id, user_id: userId, role: SpaceRolesEnum.ADMIN})
        return space
    }
}

export default spacesService