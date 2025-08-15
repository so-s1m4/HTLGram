import { ErrorWithStatus } from "../../../common/middlewares/errorHandlerMiddleware"
import { friendModel } from "../../friends/friends.model"
import { HydratedDocument, Types } from "mongoose"
import { ChatModel, GroupModel, SpaceMemberModel } from "../spaces.model"
import { ChatI, SpaceRolesEnum, SpaceTypesEnum } from "../spaces.types"
import { ImageInfoI, UserI, UserModel } from "../../users/users.model"
import { createGroupDto } from "./groups.dto"

export type GroupPublicResponse = {
    id: string,
    title: string,
    type: SpaceTypesEnum.GROUP,
    img: ImageInfoI[],
    updatedAt: Date,
    createdAt: Date,
}

const groupService = {
    async createGroup(userId: Types.ObjectId, dto: createGroupDto): 
        Promise<GroupPublicResponse>
    {   
        const user = await UserModel.findOneOrError({_id: userId})
        const group = await GroupModel.create({title: dto.title})
        const member = await SpaceMemberModel.create({spaceId: group._id, userId: user._id, role: SpaceRolesEnum.ADMIN})
        return {
            id: String(group._id),
            title: group.title,
            type: SpaceTypesEnum.GROUP,
            img: group.img,
            updatedAt: group.updatedAt,
            createdAt: group.createdAt
        }
    }
}

export default groupService