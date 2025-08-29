import { HydratedDocument, Types } from "mongoose"
import { GroupModel, SpaceMemberModel, SpaceModel } from "./spaces.model"
import { ChatI, GroupI, SpaceRolesEnum, SpaceTypesEnum } from "./spaces.types"
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware"
import { CommunicationModel, PayloadModel } from "../../modules/communications/communication.model"
import { ImageInfoI, UserI, UserModel } from "../../modules/users/users.model"
import communicationService, { MediaResponse } from "../../modules/communications/communication.service"
import { getMembersDto, leaveDto, readMessagesDto, togleAdminDto, updateSpaceDto } from "./spaces.dto"
import { ImageInfoR, UserShortPublicResponse } from "../../modules/users/users.responses"
import { isUserOnline } from "../../socket/socket.utils"
import deleteFile from "../../common/utils/utils.deleteFile"

export type LastMessage = {
    id: string,
    seq: number,
    text: string,
    createdAt: Date, 
    editedAt: Date
}

export type SpaceShortResponse = {
    id: string,
    title: string,
    type: SpaceTypesEnum,
    img: ImageInfoI[],
    updatedAt: Date,
    createdAt: Date,
}

export type SpacePublicResponse = {
    id: string,
    title: string,
    type: SpaceTypesEnum,
    img: ImageInfoI[],
    updatedAt: Date,
    createdAt: Date,
    role: SpaceRolesEnum,
    isMuted: boolean,
    isBaned: boolean,
    lastMessage?: LastMessage,
    memberCount?: number,
    media?: MediaResponse[],
    unreadCount?: number,
    lastReadMessageSeq?: number,

    chat?: {
        friendId: string
    }

    group?: {
        owner: UserShortPublicResponse | undefined,
        members?: SpaceMemberResponse[]
    }
}

export type LastReadSeqResponse = {
    lastReadSeq: number,
    userId: string,
    spaceId: string
}

export type SpaceMemberResponse = {
    spaceId: string,
    user: UserShortPublicResponse,
    role: SpaceRolesEnum,
    isMuted: boolean,
    isBaned: boolean,
    isOnline?: boolean
}

const spacesService = {
    async getSpacesList(userId: Types.ObjectId): Promise<SpacePublicResponse[]> {
        const spaces = await SpaceMemberModel.aggregate([
            {
                $match: { userId: new Types.ObjectId(userId) }
            },
            {
                $lookup: {
                    from: "spaces",
                    localField: "spaceId",
                    foreignField: "_id",
                    as: "space"
                }
            },
            {
                $unwind: "$space"
            },
            {
                $lookup: {
                    from: "users",
                    localField: "space.owner",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                $unwind: {
                    path: "$owner",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "space.user1_id",
                    foreignField: "_id",
                    as: "user1"
                }
            },
            {
                $unwind: {
                    path: "$user1",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "space.user2_id",
                    foreignField: "_id",
                    as: "user2"
                }
            },
            {
                $unwind: {
                    path: "$user2",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "communications",
                    let: { sid: "$space._id" },
                    pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                { $eq: ["$spaceId", "$$sid"] },
                                { $eq: ["$isConfirmed", true] }
                                ]
                            }
                        }
                    },
                    { $sort: { createdAt: -1 } },
                    { $limit: 1 }
                    ],
                    as: "lastMessage"
                }
            },
            {
                $unwind: {
                    path: "$lastMessage",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                from: "spacemembers",
                localField: "spaceId",
                foreignField: "spaceId",
                as: "members"
                }
            },
            {
                $addFields: {
                memberCount: { $size: "$members" }
                }
            },
            {
                $lookup: {
                    from: "communications",
                    let: { spaceId: "$spaceId", lrs: "$lastReadSeq"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq: ["$spaceId", "$$spaceId"]},
                                        {$gt: ["$seq", "$$lrs"]}
                                    ]
                                }
                            }
                        },
                        {$count: "cnt"}
                    ],
                    as: "unreadStat"
                }
            },
            {
                $addFields: {
                    unreadCount: {
                        $ifNull: [{ $arrayElemAt: ["$unreadStat.cnt", 0] }, 0]
                    }
                }
            },
            {
                $project: {
                    spaceId: 1,
                    role: 1,
                    isMuted: 1,
                    isBaned: 1,
                    space: 1,
                    user1: 1,
                    user2: 1,
                    memberCount: 1,
                    owner: 1,
                    unreadCount: 1,
                    lastReadSeq: 1,
                    "lastMessage.id": "$lastMessage._id",
                    "lastMessage.seq": 1,
                    "lastMessage.text": 1,
                    "lastMessage.createdAt": 1,
                    "lastMessage.editedAt": 1
                }
            }
        ])
        let res: SpacePublicResponse[] = []
        for (let space of spaces) {
            if (space.space.type === SpaceTypesEnum.CHAT) {
                res.push({
                    id: space.spaceId.toString(),
                    title: space.space.user1_id.toString() === String(userId) ? space.user2.username : space.user1.username,
                    type: SpaceTypesEnum.CHAT,
                    img: space.space.user1_id.toString() === String(userId) ? space.user2.img : space.user1.img,
                    updatedAt: space.space.updatedAt,
                    createdAt: space.space.createdAt,
                    role: space.role,
                    isMuted: space.isMuted,
                    isBaned: space.isBaned,
                    lastMessage: space.lastMessage || undefined,
                    memberCount: space.memberCount,
                    unreadCount: space.unreadCount,
                    lastReadMessageSeq: space.lastReadSeq,
                    chat: {
                        friendId: space.space.user1_id.toString() === String(userId) ? space.space.user2_id.toString() : space.space.user1_id.toString()
                    }
                })
            } else if (space.space.type === SpaceTypesEnum.GROUP) {
                res.push({
                    id: space.spaceId.toString(),
                    title: space.space.title,
                    type: SpaceTypesEnum.GROUP,
                    img: space.space.img,
                    updatedAt: space.space.updatedAt,
                    createdAt: space.space.createdAt,
                    role: space.role,
                    isMuted: space.isMuted,
                    isBaned: space.isBaned,
                    lastMessage: space.lastMessage || undefined,
                    memberCount: space.memberCount,
                    unreadCount: space.unreadCount,
                    lastReadMessageSeq: space.lastReadSeq,
                    group: {
                        owner: space.owner ? {
                            id: String(space.owner._id),
                            username: space.owner.username,
                            img: space.owner.img
                        } : undefined
                    }
                })
            } else {
                res.push({
                    id: space.spaceId.toString(),
                    title: space.space.title,
                    type: SpaceTypesEnum.POSTS,
                    img: space.space.img,
                    updatedAt: space.space.updatedAt,
                    createdAt: space.space.createdAt,
                    role: space.role,
                    isMuted: space.isMuted,
                    isBaned: space.isBaned,
                    lastMessage: space.lastMessage || undefined,
                    memberCount: space.memberCount
                })
            }
            
        }

        return res
    },

    async deleteSpace(spaceId: string, userId: Types.ObjectId): Promise<{members: string[], spaceId: string, spaceType: string}> {
        const space = await SpaceModel.findById(spaceId)
        if (!space) throw new ErrorWithStatus(404, "Space not found")
        if (
            (space.type === SpaceTypesEnum.GROUP || space.type === SpaceTypesEnum.CHANEL) &&
            (space as any).owner &&
            String((space as any).owner) !== String(userId)
        ) throw new ErrorWithStatus(400, "You are not owner") 
        if (space.type === SpaceTypesEnum.POSTS) throw new ErrorWithStatus(400, "Not allowed to deleate posts")
        const member = await SpaceMemberModel.findOneOrError({spaceId, userId})
        if ((member).role !== SpaceRolesEnum.ADMIN) throw new ErrorWithStatus(400, "You are not admin")

        const comms = await CommunicationModel.find({
            spaceId: new Types.ObjectId(spaceId)
        }).select("_id").lean().exec()
        
        if (comms.length > 0) {
            await communicationService.deleteMessages(
                { messages: comms.map(c => c._id.toString()) },
                userId
            )
        }
        
        const members = await SpaceMemberModel.find({ spaceId }).exec()
        await SpaceMemberModel.deleteMany({ spaceId }).exec()
        await space.deleteOne()
        return { 
            members: members.map(member => String(member.userId)), 
            spaceId,
            spaceType: space.type
        }
    },

    async getInfo(spaceId: string, userId: Types.ObjectId): Promise<SpacePublicResponse> {
        const member = await SpaceMemberModel.findOneOrError({spaceId, userId})
        const space = await SpaceModel.findById(spaceId).lean()
        if (!space) throw new ErrorWithStatus(404, "Space not found")
        const medias = await PayloadModel.find({spaceId}).populate<{owner: {username: string, _id: Types.ObjectId, img: ImageInfoR[]}}>("owner", "username _id img").exec()
        const mediasR = medias.map(media => ({
            id: String(media._id),
            communicationId: String(media.communicationId),
            owner: {
                id: String(media.owner._id),
                username: media.owner.username,
                img: media.owner.img
            },
            type: media.type,
            mime: media.mime,
            size: media.size,
            path: media.path,
            createdAt: media.createdAt
        }))
        if (space.type === SpaceTypesEnum.CHAT) {
            const chat = space as unknown as HydratedDocument<ChatI>
            const user = await UserModel.findOne({_id: String(chat.user1_id) === String(userId) ? chat.user2_id : chat.user1_id}).select<{img: ImageInfoI[], username: string}>("img username").lean()
            if (!user) throw new ErrorWithStatus(404, "User not found")
            const lastMessage = await CommunicationModel.findOne({
                spaceId: chat._id,
                isConfirmed: true,
                text: { $regex: /^.{2,}/ }
            }).sort({createdAt: -1}).select<{text: string, createdAt: Date, editedAt: Date, seq: number, id: string}>("text createdAt editedAt seq id -_id").lean()
            const memberCount = await SpaceMemberModel.countDocuments({spaceId: chat._id})
            return {
                id: chat._id.toString(),
                title: user.username,
                type: SpaceTypesEnum.CHAT,
                img: user.img,
                updatedAt: chat.updatedAt,
                createdAt: chat.createdAt,
                role: member.role,
                isMuted: member.isMuted,
                isBaned: member.isBaned,
                lastMessage: lastMessage ? lastMessage : undefined,
                memberCount,
                media: mediasR,
                chat: {
                    friendId: chat.user1_id.toString() === String(userId) ? chat.user2_id.toString() : chat.user1_id.toString()
                }
                
            }
        } else if (space.type === SpaceTypesEnum.GROUP) {
            const group = space as unknown as HydratedDocument<GroupI>
            const lastMessage = await CommunicationModel.findOne({
                spaceId: group._id,
                isConfirmed: true,
                text: { $regex: /^.{2,}/ }
            }).sort({createdAt: -1}).select<{text: string, createdAt: Date, editedAt: Date, seq: number, id: string}>("text createdAt editedAt seq id -_id").lean()
            // const memberCount = await SpaceMemberModel.countDocuments({spaceId: group._id})
            const members = await SpaceMemberModel.find({spaceId}).populate<{userId: UserI}>("userId", "username _id img").exec()
            const owner = await UserModel.findOneOrError({_id: group.owner})
            return {
                id: group._id.toString(),
                title: group.title,
                type: SpaceTypesEnum.GROUP,
                img: group.img,
                updatedAt: group.updatedAt,
                createdAt: group.createdAt,
                role: member.role,
                isMuted: member.isMuted,
                isBaned: member.isBaned,
                lastMessage: lastMessage ? lastMessage : undefined,
                memberCount: members.length,
                media: mediasR,
                group: {
                    members: members.map(member => ({
                        spaceId: member.spaceId.toString(),
                        user: {
                            id: String(member.userId._id),
                            username: member.userId.username,
                            img: member.userId.img
                        },
                        role: member.role,
                        isMuted: member.isMuted,
                        isBaned: member.isBaned
                    })),
                    owner: {
                        id: String(owner._id),
                        username: owner.username,
                        img: owner.img
                    }
                }
            }
        }
        return space as unknown as SpacePublicResponse // remove if new types are added
    },

    async readMessages(data: readMessagesDto, userId: Types.ObjectId): Promise<LastReadSeqResponse> {
        const communication = await CommunicationModel.findOneOrError({
            seq: data.messageSeq,
            spaceId: new Types.ObjectId(data.spaceId)
        })
        const member = await SpaceMemberModel.findOneOrError({
            spaceId: new Types.ObjectId(data.spaceId),
            userId
        })
        if (member.isBaned) throw new ErrorWithStatus(403, "You are banned from this space")
        
        member.lastReadSeq = communication.seq
        await member.save()
        return {
            lastReadSeq: member.lastReadSeq,
            userId: userId.toString(),
            spaceId: member.spaceId.toString()
        }
    },

    async getMembers(data: getMembersDto, userId: Types.ObjectId): Promise<SpaceMemberResponse[]> {
        const space = await SpaceModel.findById(data.spaceId).lean()
        if (!space) throw new ErrorWithStatus(404, "Space not found")
        // if add channel REWRITE
        if (space.type === SpaceTypesEnum.CHANEL) throw new ErrorWithStatus(400, "You cann't get members in channel")
        const member = await SpaceMemberModel.findOneOrError({userId, spaceId: data.spaceId})
        const members = await SpaceMemberModel.find({spaceId: data.spaceId}).populate<{userId: UserI}>("userId", "username _id img").limit(data.limit).skip(data.skip).lean()
        return members.map(member => ({
            spaceId: member.spaceId.toString(),
            user: {
                username: member.userId.username,
                img: member.userId.img,
                id: String(member.userId._id)
            },
            role: member.role,
            isMuted: member.isMuted,
            isBaned: member.isBaned,
            isOnline: isUserOnline(String(member.userId._id)) ? true : false
        }))
    },

    async addAdmin(data: togleAdminDto, userId: Types.ObjectId): Promise<SpaceMemberResponse> {
        const space = await SpaceModel.findById(data.spaceId).exec()
        if (!space) throw new ErrorWithStatus(404, "Space not found")
        if (space.type !== SpaceTypesEnum.GROUP && space.type !== SpaceTypesEnum.CHANEL) throw new ErrorWithStatus(400, "You can add admin only for groups and channels")
        const group = space as unknown as GroupI
        if (String(group.owner) !== String(userId)) throw new ErrorWithStatus(400, "You are not owner of this space")
        const member = await SpaceMemberModel.findOne({spaceId: data.spaceId, userId: data.adminId, role: SpaceRolesEnum.MEMBER}).populate<{userId: UserI}>("userId", "username _id img").exec()
        if (!member) throw new ErrorWithStatus(404, "Member not found")
        member.role = SpaceRolesEnum.ADMIN
        await member.save()
        return {
            spaceId: member.spaceId.toString(),
            user: {
                username: member.userId.username,
                img: member.userId.img,
                id: String(member.userId._id)
            },
            role: member.role,
            isMuted: member.isMuted,
            isBaned: member.isBaned,
        }
    },

    async removeAdmin(data: togleAdminDto, userId: Types.ObjectId): Promise<SpaceMemberResponse> {
        const space = await SpaceModel.findById(data.spaceId).exec()
        if (!space) throw new ErrorWithStatus(404, "Space not found")
        if (space.type !== SpaceTypesEnum.GROUP && space.type !== SpaceTypesEnum.CHANEL) throw new ErrorWithStatus(400, "You can remove admin only for groups and chanels")
        const group = space as unknown as GroupI
        if (String(group.owner) !== String(userId)) throw new ErrorWithStatus(400, "You are not owner of this space")
        if (String(group.owner) === String(data.adminId)) throw new ErrorWithStatus(400, "You cann't make owner an admin")
        const member = await SpaceMemberModel.findOne({spaceId: data.spaceId, userId: data.adminId, role: SpaceRolesEnum.ADMIN}).populate<{userId: UserI}>("userId", "username _id img").exec()
        if (!member) throw new ErrorWithStatus(404, "Member not found")
        member.role = SpaceRolesEnum.MEMBER
        await member.save()
        return {
            spaceId: member.spaceId.toString(),
            user: {
                username: member.userId.username,
                img: member.userId.img,
                id: String(member.userId._id)
            },
            role: member.role,
            isMuted: member.isMuted,
            isBaned: member.isBaned,
        }
    },

    async leave(data: leaveDto, userId: Types.ObjectId): Promise<SpaceMemberResponse> {
        let space = await SpaceModel.findById(data.spaceId).exec()
        if (!space) throw new ErrorWithStatus(404, "Space not found")
        if (space.type === SpaceTypesEnum.POSTS || space.type === SpaceTypesEnum.CHAT) throw new ErrorWithStatus(400, "You cann't leave from chat and posts")
        const member = await SpaceMemberModel.findOne({spaceId: data.spaceId, userId: userId}).populate<{userId: UserI}>("userId", "username _id img").exec()
        if (!member) throw new ErrorWithStatus(404, "Member not found")
        const group = space as unknown as HydratedDocument<GroupI>
        if (String(member.userId._id) !== String(group.owner)) {
            await member.deleteOne()
        } else {
            const memberCount = await SpaceMemberModel.countDocuments({spaceId: data.spaceId})
            if (memberCount === 1) {
                await this.deleteSpace(data.spaceId, userId)
            } else {
                let featureOwner = await SpaceMemberModel.findOne({
                    spaceId: data.spaceId,
                    role: SpaceRolesEnum.ADMIN,
                    _id: { $ne: member._id }
                });

                if (!featureOwner) {
                    featureOwner = await SpaceMemberModel.findOne({ 
                        spaceId: data.spaceId,
                        _id: { $ne: member._id }
                    });
                    if (!featureOwner) throw new ErrorWithStatus(404, "Feature owner not found")
                    featureOwner.role = SpaceRolesEnum.ADMIN
                    await featureOwner.save()
                }
                group.owner = featureOwner.userId
                await group.save()
                await member.deleteOne()
            }
        }
        return {
            spaceId: String(member.spaceId),
            user: {
                id: String(member.userId._id),
                username: member.userId.username,
                img: member.userId.img
            },
            role: member.role,
            isMuted: member.isMuted,
            isBaned: member.isBaned
        }
    },

    async updateSpaceData(data: updateSpaceDto, userId: Types.ObjectId, spaceId: Types.ObjectId): Promise<SpaceShortResponse> {
        const member = await SpaceMemberModel.findOneOrError({spaceId, userId})
        if (member.role !== SpaceRolesEnum.ADMIN) throw new ErrorWithStatus(400, "You are not admin")
        const space = await GroupModel.findById(spaceId).exec()
        // Edit if channel is added
        if (!space) throw new ErrorWithStatus(404, "Group not found")
        if (data.title) space.title = data.title
        if (data.file) {
            if (space.img.length >= 5) throw new ErrorWithStatus(400, "You alreade have 5 photos uploaded")
            space.img.push({path: data.file.filename, size: data.file.size})
        }
        await space.save()
        return {
            id: String(space._id),
            title: space.title,
            type: SpaceTypesEnum.GROUP,
            img: space.img,
            updatedAt: space.updatedAt,
            createdAt: space.createdAt
        }
    },

    async deleteSpacePhoto(userId: Types.ObjectId, spaceId: Types.ObjectId, photoPath: string) {
        const member = await SpaceMemberModel.findOneOrError({spaceId, userId})
        if (member.role !== SpaceRolesEnum.ADMIN) throw new ErrorWithStatus(400, "You are not admin")
        const space = await GroupModel.findById(spaceId).exec()
        // Edit if channel is added
        if (!space) throw new ErrorWithStatus(404, "Group not found")
        
        const idx = space.img.findIndex((p) => p.path === photoPath);
        if (idx === undefined || idx < 0) throw new ErrorWithStatus(404, 'Photo not found');
        space.img.splice(idx, 1);
        deleteFile(photoPath);
        await space.save();
    }
}

export default spacesService