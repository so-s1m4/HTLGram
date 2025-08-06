import { HydratedDocument, Types } from "mongoose"
import { SpaceMemberModel, SpaceModel } from "./spaces.model"
import { BaseSpaceI, ChatI, SpaceRolesEnum, SpaceTypesEnum } from "./spaces.types"
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware"
import { CommunicationModel, PayloadModel } from "../../modules/communications/communication.model"
import { ImageInfoI, UserModel } from "../../modules/users/users.model"
import getServerJWT from "../../common/utils/utils.getServersJWT"
import { config } from "../../config/config"
import { EmojiCommunicationModel } from "../../modules/emojis/emojis.model"

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
    // chat?: {}
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
                    "user2.username": 1,
                    "user2.img": 1
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
                    "user2.username": 1,
                    "user2.img": 1
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
                    "user2.username": 1,
                    "user2.img": 1,
                    "lastMessage.text": 1,
                    "lastMessage.createdAt": 1,
                    "lastMessage.editedAt": 1
                }
            }
        ])
        let res: SpacePublicResponse[] = []

        for (let space of spaces) {
            res.push({
                id: space.spaceId.toString(),
                title: space.space.title || space.space.user1_id.toString() === String(userId) ? space.user2.username : space.user1.username,
                type: SpaceTypesEnum.CHAT,
                img: space.space.img || space.space.user1_id.toString() === String(userId) ? space.user2.img : space.user1.img,
                updatedAt: space.space.updatedAt,
                createdAt: space.space.createdAt,
                lastMessage: space.lastMessage || undefined
            })
        }

        return res
    },

    async deleteSpace(spaceId: string, userId: Types.ObjectId) {
        const space = await SpaceModel.findById(spaceId)
        if (!space) throw new ErrorWithStatus(404, "Space not found")
        if (space.type === SpaceTypesEnum.POSTS) throw new Error("Not allowed")
        const member = await SpaceMemberModel.findOneOrError({spaceId, userId})
        if ((member).role !== SpaceRolesEnum.ADMIN) throw new Error("You are not admin")
        
        const communications = await CommunicationModel.aggregate([
            { $match: { spaceId: new Types.ObjectId(spaceId) } },
            {
                $lookup: {
                    from: "payloads",
                    localField: "_id",
                    foreignField: "communicationId",
                    as: "media"
                }
            },
            {
                $unwind: {
                    path: "$media",
                    preserveNullAndEmptyArrays: true
                }
            }
        ])
        
        const mediaIds: string[] = []
        const user_storage = new Map<string, number>()

        for (let communication of communications) {
            const media = communication.media
            if (!media) continue 

            const mediaId = media._id?.toString()
            const ownerId = media.owner?.toString()
            const size = media.size

            if (mediaId) mediaIds.push(mediaId) 
            if (ownerId && typeof size === "number") {
                const prev = user_storage.get(ownerId) || 0
                user_storage.set(ownerId, prev + size) 
            }
        }


        if (mediaIds.length > 0) {
            const res = await fetch(config.MEDIA_SERVER+"/media", {
                "method":"DELETE",
                "headers": {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer "+getServerJWT()
                },
                "body": JSON.stringify({
                    media: mediaIds
                }),
            })
            
            if (!res.ok) {
                throw new ErrorWithStatus(res.status, "Media server error");
            }

            for (let key of user_storage.keys()) {
                await UserModel.updateOne(
                    {_id: key},
                    {$inc: {storage: -user_storage.get(key)!}}
                ).exec()
            }

            await PayloadModel.deleteMany({
                _id: { $in: mediaIds }
            }).exec()
        }
        
        await EmojiCommunicationModel.deleteMany({
            communicationId: { $in: communications.map(c => c._id)}
        }).exec()
        await CommunicationModel.deleteMany({spaceId}).exec()
        await SpaceMemberModel.deleteMany({ spaceId }).exec()
        await space.deleteOne()
        return { deleted: true }
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
            }).sort({createdAt: -1}).select<{text: string, createdAt: Date, editedAt: Date}>("text createdAt editedAt").lean()
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
    }
}

export default spacesService