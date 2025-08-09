import { Types } from "mongoose"
import { CommunicationModel, PayloadModel } from "./communication.model"
import { SpaceMemberModel, SpaceModel } from "./../spaces/spaces.model"
import { ErrorWithStatus } from "./../../common/middlewares/errorHandlerMiddleware"
import { EmojiCommunicationModel } from "../../modules/emojis/emojis.model"
import { UserModel } from "../../modules/users/users.model"
import { CommunicationI } from "./communication.types"
import { createCommunicationDto, deleteMediaCommunicationDto, deleteMessagesCommunicationDto, getLIstCommunicationDto, updateCommunicationDto } from "./communication.dto"
import { SpaceRolesEnum, SpaceTypesEnum } from "../../modules/spaces/spaces.types"
import { config } from "../../config/config"
import getServerJWT from "../../common/utils/utils.getServersJWT"
import { UserShortPublicResponse } from "../../modules/users/users.responses"
import { EmojiCommunicationResponse, EmojiCommunicationWithoutSpaceResponse } from "../../modules/emojis/emojis.service"


export type MediaResponse = {
    id: string,
    communicationId: string,
    owner: string,
    type: string,
    mime: string,
    size: number,
    path: string,
    createdAt: Date,
    updatedAt: Date,
}


export type CommunicationResponse = {
    id: string,
    sender: UserShortPublicResponse,
    spaceId: string,
    text: string,
    repliedOn: string | null,
    isConfirmed?: boolean,
    editedAt: Date,
    createdAt: Date,
    media: MediaResponse[],
    emojis: EmojiCommunicationWithoutSpaceResponse[],
}

export type updateCommunicationPublicResponse = {
    id: string,
    text?: string,
    senderId: string,
    spaceId: string,
    editedAt: Date,
}


export type deleteMediaPublicResponse = {
    id: string,
    communicationId: string,
    spaceId: string,
}

export type deleteMessagesPublicResponse = {
    id: string,
    spaceId: string,
}

const communicationService = {
    async getList(data: getLIstCommunicationDto, userId: Types.ObjectId): Promise<CommunicationResponse[]> {
        const space = await SpaceModel.findById(data.spaceId);
        if (!space) throw new Error("Space not found");
        const member = await SpaceMemberModel.findOne({
          spaceId: data.spaceId,
          userId,
        })
        if (space.type !== SpaceTypesEnum.POSTS && (!member || member.isBaned)) throw new Error("You are banned or muted in this space");

        const communications = await CommunicationModel.aggregate([
            {
                $match: {
                    spaceId: new Types.ObjectId(data.spaceId),
                    isConfirmed: true
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: data.skip
            },
            {
                $limit: data.limit
            },
            {
                $lookup: {
                    from: "users",
                    localField: "senderId",
                    foreignField: "_id",
                    as: "sender"
                }
            },
            {
                $unwind: "$sender"
            },
            {
                $lookup: {
                    from: "payloads",
                    let: {"communicationId": "$_id"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$communicationId", "$$communicationId"]
                                }
                            }
                        },
                        {
                            $project: {
                                id: {$toString: "$_id"},
                                _id: 0,
                                communicationId: {$toString: "$communicationId"},
                                owner: {$toString: "$owner"},
                                type: 1,
                                mime: 1,
                                size: 1,
                                path: 1,
                                createdAt: 1,
                                updatedAt: 1,
                            }
                        }
                    ],
                    as: "media"
                }
            },
            {
                $lookup: {
                    from: "emojicommunications",
                    let: {"communicationId": "$_id"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$communicationId", "$$communicationId"]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "userId",
                                foreignField: "_id",
                                as: "userId"
                            }
                        },
                        {
                            $unwind: "$userId"
                        },
                        {
                            $lookup: {
                                from: "emojis",
                                localField: "emojiId",
                                foreignField: "_id",
                                as: "emoji"
                            }
                        },
                        {
                            $unwind: "$emoji"
                        },
                        {
                            $project: {
                                emoji: {
                                    id: {$toString: "$emoji._id"},
                                    name: "$emoji.name",
                                    url: "$emoji.url"
                                },
                                _id: 0,
                                communicationId: {$toString: "$communicationId"},
                                user: {
                                    id: {$toString: "$userId._id"},
                                    username: "$userId.username",
                                    img: "$userId.img"
                                },
                                createdAt: 1,
                                updatedAt: 1
                            }
                        }
                    ],
                    as: "emojis"
                }
            },
            {
                $project: {
                    id: { $toString: "$_id" },
                    sender: { id: { $toString: "$sender._id" }, username: "$sender.username", img: "$sender.img" },
                    spaceId: { $toString: "$spaceId" },
                    text: 1,
                    repliedOn: 1,
                    editedAt: 1,
                    createdAt: 1,
                    media: 1,
                    emojis: 1,
                    _id: 0
                }
            }
            
        ])

        return communications
    },

    async close(data: {communicationId: string}, userId: Types.ObjectId): Promise<{
        communication: CommunicationResponse,
        isNew: boolean
    }> {
        const communications = await CommunicationModel.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(data.communicationId), 
                    senderId: new Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "senderId",
                    foreignField: "_id",
                    as: "sender"
                }
            },
            {
                $unwind: "$sender"
            },
            {
                $lookup: {
                    from: "payloads",
                    let: {"communicationId": "$_id"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$communicationId", "$$communicationId"]
                                }
                            }
                        },
                        {
                            $project: {
                                id: {$toString: "$_id"},
                                _id: 0,
                                communicationId: {$toString: "$communicationId"},
                                owner: {$toString: "$owner"},
                                type: 1,
                                mime: 1,
                                size: 1,
                                path: 1,
                                createdAt: 1,
                                updatedAt: 1,
                            }
                        }
                    ],
                    as: "media"
                }
            },
            {
                $lookup: {
                    from: "emojicommunications",
                    let: {"communicationId": "$_id"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$communicationId", "$$communicationId"]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "userId",
                                foreignField: "_id",
                                as: "userId"
                            }
                        },
                        {
                            $unwind: "$userId"
                        },
                        {
                            $lookup: {
                                from: "emojis",
                                localField: "emojiId",
                                foreignField: "_id",
                                as: "emoji"
                            }
                        },
                        {
                            $unwind: "$emoji"
                        },
                        {
                            $project: {
                                id: {$toString: "$_id"},
                                _id: 0,
                                communicationId: {$toString: "$communicationId"},
                                user: {
                                    id: {$toString: "$userId._id"},
                                    username: "$userId.username",
                                    img: "$userId.img"
                                },
                                name: "$emoji.name",
                                url: "$emoji.url",
                                createdAt: 1,
                                updatedAt: 1
                            }
                        }
                    ],
                    as: "emojis"
                }
            },
            {
                $project: {
                    id: { $toString: "$_id" },
                    sender: { id: { $toString: "$sender._id" }, username: "$sender.username", img: "$sender.img" },
                    spaceId: { $toString: "$spaceId" },
                    text: 1,
                    repliedOn: 1,
                    isConfirmed: 1,
                    editedAt: 1,
                    createdAt: 1,
                    media: 1,
                    emojis: 1,
                    _id: 0
                }
            },
            {
                $limit: 1
            }
        ]).exec()

        if (communications.length === 0) throw new Error("Communication not found or you are not the sender");

        const communication = communications[0];

        if (!communication.isConfirmed) {
            await CommunicationModel.updateOne(
                { _id: new Types.ObjectId(data.communicationId) },
                { isConfirmed: true }
            ).exec();

            communication.isConfirmed = true; 
            return { communication, isNew: true };
        }

        return { communication, isNew: false };
    },

    async create(data: createCommunicationDto, userId: Types.ObjectId): Promise<{ id: string }> {
        const space = await SpaceModel.findOne({ _id: data.spaceId }).exec()
        if (!space) throw new ErrorWithStatus(404, "Space not found")
        const member = await SpaceMemberModel.findOneOrError({userId, spaceId: data.spaceId})
        if (data.repliedOn) {
            const repliedOn = await CommunicationModel.findOneOrError({_id: data.repliedOn, spaceId: data.spaceId})
            if (!repliedOn.isConfirmed) throw new ErrorWithStatus(400, "You need to close communication first")
        }
        if (space.type in [SpaceTypesEnum.GROUP, SpaceTypesEnum.CHAT] && (member.isBaned || member.isMuted)) throw new ErrorWithStatus(403, "You are banned or muted in this space")
        if (space.type in [SpaceTypesEnum.CHANEL, SpaceTypesEnum.POSTS] && member.role !== SpaceRolesEnum.ADMIN) throw new ErrorWithStatus(400, "You can't send messages in this space type")
        const communication = await CommunicationModel.create({
            ...data,
            senderId: userId,
            expiresAt: new Date(Date.now() + config.TIME_TO_DELETE_COMMUNICATION * 60 * 1000),
            editedAt: new Date()
        })
        return {id: communication._id.toString()}
    },
    
    async update(data: updateCommunicationDto, userId: Types.ObjectId): Promise<updateCommunicationPublicResponse> {
        const communication = await CommunicationModel.findOneOrError({_id: data.communicationId, senderId: userId})
        if (!communication.isConfirmed) throw new ErrorWithStatus(400, "You need to close communication first")
        communication.text = data.text
        communication.editedAt = new Date()
        await communication.save()
        return {
            id: communication._id.toString(),
            text: communication.text,
            senderId: communication.senderId.toString(),
            spaceId: communication.spaceId.toString(),
            editedAt: communication.editedAt
        }
    },

    async deleteMedias(data: deleteMediaCommunicationDto, userId: Types.ObjectId): Promise<deleteMediaPublicResponse[]> {
        const medias = await PayloadModel.find({
            _id: { $in: data.media }
        })
        .populate<{ communicationId: CommunicationI }>("communicationId")
        .exec();

        if (medias.length !== data.media.length) {
            throw new ErrorWithStatus(404, "Some media not found");
        }

        const spaceIds = new Set<string>();
        for (const media of medias) {
            if (!media.communicationId) {
                throw new ErrorWithStatus(404, "Communication not found");
            }
            if (!media.communicationId.isConfirmed) {
                throw new ErrorWithStatus(404, "You need to close communications first");
            }
            spaceIds.add(media.communicationId.spaceId.toString());
        }


        const spaceIdArray = Array.from(spaceIds).map(id => new Types.ObjectId(id));
        const spaces = await SpaceModel.find({ _id: { $in: spaceIdArray } }).lean(); 
        if (spaces.length !== spaceIds.size) {
            throw new ErrorWithStatus(404, "Some spaces not found");
        }

        const members = await SpaceMemberModel.find({
            spaceId: { $in: spaceIdArray },
            userId
        }).lean(); 

        if (members.length !== spaceIds.size) {
            throw new ErrorWithStatus(403, "You are not in all chats of these media"); 
        }

        for (const space of spaces) {
            const member = members.find(m => m.spaceId.toString() === space._id.toString());
            if (!member) {
                throw new ErrorWithStatus(403, "You are not in this space"); 
            }

            if ([SpaceTypesEnum.GROUP, SpaceTypesEnum.CHAT].includes(space.type  as SpaceTypesEnum) &&
                (member.isBaned || member.isMuted)) {
                throw new ErrorWithStatus(403, "You are banned or muted in this space");
            }

            if ([SpaceTypesEnum.CHANEL, SpaceTypesEnum.POSTS].includes(space.type as SpaceTypesEnum) &&
                member.role !== SpaceRolesEnum.ADMIN) {
                throw new ErrorWithStatus(400, "You can't delete medias in this space type");
            }
        }

        const user_storage = new Map<string, number>();
        for (const media of medias) {
            const ownerId = media.owner.toString();
            const prev = user_storage.get(ownerId) || 0;
            user_storage.set(ownerId, prev + media.size);
        }

        const res = await fetch(config.MEDIA_SERVER + "/media", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + getServerJWT()
            },
            body: JSON.stringify({
                media: medias.map(i => i._id.toString())
            }),
        });

        if (!res.ok) {
            throw new ErrorWithStatus(res.status, "Media server error");
        }

        const bulkOps = Array.from(user_storage.entries()).map(([ownerId, size]) => ({
            updateOne: {
                filter: { _id: new Types.ObjectId(ownerId) },
                update: { $inc: { storage: -size } }
            }
        }));

        if (bulkOps.length > 0) {
            await UserModel.bulkWrite(bulkOps); 
        }

        await PayloadModel.deleteMany({
            _id: { $in: medias.map(m => m._id) }
        }).exec();

        return medias.map(media => ({
            id: media._id.toString(),
            communicationId: media.communicationId._id.toString(),
            spaceId: media.communicationId.spaceId.toString(),
        }))
    },


    async deleteMessages(data: deleteMessagesCommunicationDto, userId: Types.ObjectId): Promise<deleteMessagesPublicResponse[]> {
        const communications = await CommunicationModel.find({
            _id: { $in: data.messages }
        }).exec();

        if (communications.length !== data.messages.length) {
            throw new ErrorWithStatus(404, "Some messages not found");
        }

        const spaceIds = Array.from(
            new Set(communications.map(c => c.spaceId.toString()))
        );
        const spaceIdObj = spaceIds.map(id => new Types.ObjectId(id));

        const spaces = await SpaceModel.find({ _id: { $in: spaceIdObj } }).lean(); 
        if (spaces.length !== spaceIds.length) {
            throw new ErrorWithStatus(404, "Some spaces not found"); 
        }

        const members = await SpaceMemberModel.find({
            spaceId: { $in: spaceIdObj },
            userId
        }).lean(); 

        if (members.length !== spaceIds.length) {
            throw new ErrorWithStatus(403, "You are not in all chats of these messages"); 
        }

        for (const space of spaces) {
            const member = members.find(m => m.spaceId.toString() === space._id.toString());
            if (!member) {
                throw new ErrorWithStatus(403, "You are not in this space"); 
            }

            if ([SpaceTypesEnum.GROUP, SpaceTypesEnum.CHAT].includes(space.type as SpaceTypesEnum) &&
                (member.isBaned || member.isMuted)) {
                throw new ErrorWithStatus(403, "You are banned or muted in this space");
            }

            if ([SpaceTypesEnum.CHANEL, SpaceTypesEnum.POSTS].includes(space.type as SpaceTypesEnum) &&
                member.role !== SpaceRolesEnum.ADMIN) {
                throw new ErrorWithStatus(400, "You can't delete messages in this space type");
            }
        }

        await CommunicationModel.updateMany(
            { repliedOn: { $in: data.messages } },
            { $set: { repliedOn: null } }
        ).exec();

        const payloadIds = (await PayloadModel.find({
            communicationId: { $in: data.messages }
        }).select("_id").lean()).map(p => String(p._id));

        if (payloadIds.length > 0) {
            await this.deleteMedias({ media: payloadIds }, userId);
        }

        await EmojiCommunicationModel.deleteMany({
            communicationId: { $in: data.messages }
        }).exec();

        await CommunicationModel.deleteMany({
            _id: { $in: data.messages }
        }).exec();

        return communications.map(comm => ({
            id: comm._id.toString(),
            spaceId: comm.spaceId.toString(),
        }));
    }
}

export default communicationService