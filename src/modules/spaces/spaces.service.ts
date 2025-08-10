import { HydratedDocument, Types } from "mongoose"
import { SpaceMemberModel, SpaceModel } from "./spaces.model"
import { ChatI, SpaceRolesEnum, SpaceTypesEnum } from "./spaces.types"
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware"
import { CommunicationModel } from "../../modules/communications/communication.model"
import { ImageInfoI, UserModel } from "../../modules/users/users.model"
import communicationService from "../../modules/communications/communication.service"
import { readMessagesDto } from "./spaces.dto"

export type LastMessage = {
    text: string,
    createdAt: Date, 
    editedAt: Date
}

export type SpacePublicResponse = {
    id: string,
    title: string,
    type: SpaceTypesEnum,
    img: ImageInfoI[],
    updatedAt: Date,
    createdAt: Date,
    lastMessage?: LastMessage,

    // later
    // membersCount?: number,
    chat?: {
        friendId: string
    }
}

export type LastReadSeqResponse = {
    lastReadSeq: number,
    userId: string,
    spaceId: string
}

const spacesService = {
    async getSpacesList(userId: Types.ObjectId): Promise<SpacePublicResponse[]> {
        const spaces = await SpaceMemberModel.aggregate([
            {
                $match: { userId: new Types.ObjectId(userId) }
            },
            {
                $project: {
                    spaceId: 1,
                    role: 1,
                    isMuted: 1,
                    isBaned:1,
                }
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
                $project: {
                    "space.__v": 0,

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
                $unwind: "$user1"
            },
            {
                $project: {
                    spaceId: 1,
                    role: 1,
                    isMuted: 1,
                    isBaned: 1,
                    space: 1,
                    "user1.username": 1,
                    "user1.img": 1,
                    "user1._id": 1,
                    "user2.username": 1,
                    "user2.img": 1,
                    "user2._id": 1
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
                $unwind: "$user2"
            },
            {
                $project: {
                    spaceId: 1,
                    role: 1,
                    isMuted: 1,
                    isBaned: 1,
                    space: 1,
                    "user1.username": 1,
                    "user1.img": 1,
                    "user1._id": 1,
                    "user2.username": 1,
                    "user2.img": 1,
                    "user2._id": 1
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
                                { $eq: ["$isConfirmed", true] },
                                { $regexMatch: { input: "$text", regex: /^.{2,}/ } }
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
                $project: {
                    spaceId: 1,
                    role: 1,
                    isMuted: 1,
                    isBaned: 1,
                    space: 1,
                    "user1.username": 1,
                    "user1.img": 1,
                    "user1._id": 1,
                    "user2.username": 1,
                    "user2.img": 1,
                    "user2._id": 1,
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
                    lastMessage: space.lastMessage || undefined,
                    chat: {
                        friendId: space.space.user1_id.toString() === String(userId) ? space.space.user2_id.toString() : space.space.user1_id.toString()
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
                    lastMessage: space.lastMessage || undefined
                })
            }
            
        }

        return res
    },

    async deleteSpace(spaceId: string, userId: Types.ObjectId): Promise<{deleted: boolean, spaceId: string}> {
        const space = await SpaceModel.findById(spaceId)
        if (!space) throw new ErrorWithStatus(404, "Space not found")
        if (space.type === SpaceTypesEnum.POSTS) throw new Error("Not allowed")
        const member = await SpaceMemberModel.findOneOrError({spaceId, userId})
        if ((member).role !== SpaceRolesEnum.ADMIN) throw new Error("You are not admin")

        const comms = await CommunicationModel.find({
            spaceId: new Types.ObjectId(spaceId)
        }).select("_id").lean().exec()
        
        if (comms.length > 0) {
            await communicationService.deleteMessages(
                { messages: comms.map(c => c._id.toString()) },
                userId
            )
        }
        
        await SpaceMemberModel.deleteMany({ spaceId }).exec()
        await space.deleteOne()
        return { deleted: true, spaceId}
    },

    async getInfo(spaceId: string, userId: Types.ObjectId): Promise<SpacePublicResponse> {
        const member = await SpaceMemberModel.findOneOrError({spaceId, userId})
        const space = await SpaceModel.findById(spaceId).lean()
        if (!space) throw new ErrorWithStatus(404, "Space not found")
        if (space.type === SpaceTypesEnum.CHAT) {
            const chat = space as unknown as HydratedDocument<ChatI>
            const user = await UserModel.findOne({_id: String(chat.user1_id) === String(userId) ? chat.user2_id : chat.user1_id}).select<{img: ImageInfoI[], username: string}>("img username").lean()
            if (!user) throw new ErrorWithStatus(404, "User not found")
            const lastMessage = await CommunicationModel.findOne({
                spaceId: chat._id,
                isConfirmed: true,
                text: { $regex: /^.{2,}/ }
            }).sort({createdAt: -1}).select<{text: string, createdAt: Date, editedAt: Date}>("text createdAt editedAt -_id").lean()
            return {
                id: chat._id.toString(),
                title: user.username,
                type: SpaceTypesEnum.CHAT,
                img: user.img,
                updatedAt: chat.updatedAt,
                createdAt: chat.createdAt,
                lastMessage: lastMessage ? lastMessage : undefined
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
    }
}

export default spacesService