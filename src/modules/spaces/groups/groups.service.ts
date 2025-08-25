import { ErrorWithStatus } from "../../../common/middlewares/errorHandlerMiddleware"
import { friendModel } from "../../friends/friends.model"
import { HydratedDocument, Types } from "mongoose"
import { ChatModel, GroupModel, SpaceMemberModel, SpaceModel } from "../spaces.model"
import { ChatI, SpaceRolesEnum, SpaceTypesEnum } from "../spaces.types"
import { ImageInfoI, UserI, UserModel } from "../../users/users.model"
import { createGroupDto, membersListDto } from "./groups.dto"
import { UserShortPublicResponse } from "../../../modules/users/users.responses"

export type GroupPublicResponse = {
    id: string,
    owner: string,
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
        const group = await GroupModel.create({title: dto.title, owner: userId})
        const member = await SpaceMemberModel.create({spaceId: group._id, userId: user._id, role: SpaceRolesEnum.ADMIN})
        return {
            id: String(group._id),
            owner: String(group.owner),
            title: group.title,
            type: SpaceTypesEnum.GROUP,
            img: group.img,
            updatedAt: group.updatedAt,
            createdAt: group.createdAt
        }
    },

    async addMembers(userId: Types.ObjectId, dto: membersListDto):
        Promise<UserShortPublicResponse[]>
    {   
        const memberObjects = dto.members.map(member => new Types.ObjectId(member))
        const space = await SpaceModel.findOne({
            _id: dto.spaceId,
            type: SpaceTypesEnum.GROUP
        }).lean()
        if (!space) throw new ErrorWithStatus(404, "Group not found")
        const groupMember = await SpaceMemberModel.findOneOrError({
            spaceId: dto.spaceId,
            userId,

        })
        const friends = await friendModel.aggregate([
            {
                $match: {
                    $or: [
                        {user1_id: new Types.ObjectId(userId), user2_id: {$in: memberObjects}},
                        {user1_id: {$in: memberObjects}, user2_id: new Types.ObjectId(userId)}
                    ]
                }
            },
            {
                $lookup: {
                    from: "users",
                    let: {u1: "$user1_id", u2: "$user2_id"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $cond: [
                                    { $ne: ["$$u1", new Types.ObjectId(userId)] },
                                    { $eq: ["$_id", "$$u1"] },         
                                    { $eq: ["$_id", "$$u2"] }   
                                    ]
                                }
                            }
                        }
                    ],
                    as: "user"
                }
            },
            {
                $unwind: {
                    path: "$user"
                }
            },
            {
                $lookup: {
                    from: "spacemembers",
                    let: {userId: "$user._id", spaceId: new Types.ObjectId(dto.spaceId)},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq: ["$userId", "$$userId"]},
                                        {$eq: ["$spaceId", "$$spaceId"]}
                                    ]
                                }
                            }
                        }
                    ],
                    as: "member"
                }
            },
            {
                $unwind: {
                    path: "$member",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    member: null
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$user._id",
                    username: "$user.username",
                    img: "$user.img",
                    member: "$member"
                }
            }
        ]).exec()
        const members = await SpaceMemberModel.insertMany(
            friends.map((friend: any) => ({
                spaceId: dto.spaceId,
                userId: friend.id
            }))
        )
        return friends
    },

    async removeMembers(userId: Types.ObjectId, dto: membersListDto):
        Promise<UserShortPublicResponse[]>
    {
        const space = await GroupModel.findOne({
            _id: dto.spaceId
        }).lean()
        if (!space) throw new ErrorWithStatus(404, "Group not found")
        const groupMember = await SpaceMemberModel.findOneOrError({
            spaceId: dto.spaceId,
            userId,
            role: SpaceRolesEnum.ADMIN
        })

        const membersToRemove = await SpaceMemberModel.find({
            spaceId: dto.spaceId,
            userId: { $in: dto.members, $ne: space.owner }
        }).populate<{userId: UserI}>("userId").lean();

        await SpaceMemberModel.deleteMany({
            spaceId: dto.spaceId,
            userId: { $in: dto.members, $ne: space.owner }
        });

        return membersToRemove.map(m => ({
            id: String(m.userId._id),
            username: m.userId.username,
            img: m.userId.img
        }));
    }
}

export default groupService