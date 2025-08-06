import { HydratedDocument, Types } from "mongoose"
import { SpaceMemberModel, SpaceModel } from "./spaces.model"
import { BaseSpaceI, ChatI, SpaceRolesEnum, SpaceTypesEnum } from "./spaces.types"
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware"
import { CommunicationModel } from "../../modules/communications/communication.model"
import { ImageInfoI, UserModel } from "../../modules/users/users.model"
import { CommunicationI } from "../../modules/communications/communication.types"

export type LastMessage = {
    text: string,
    createdAt: Date, 
    editedAt: Date
}

export type SpacesPublicResponse = {
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
    async getSpacesList(userId: Types.ObjectId): Promise<SpacesPublicResponse[]> {
        let res: SpacesPublicResponse[] = []
        // Get spaces where user is a member
        let spaces = await SpaceMemberModel.find({userId}).select<{role: SpaceRolesEnum, isMuted: boolean, isBaned: boolean, spaceId: Types.ObjectId}>("role isMuted isBaned spaceId").populate<{ spaceId: BaseSpaceI | ChatI }>("spaceId", " -__v").lean()
        if (!spaces || spaces.length === 0) return res
        const spaceIds = spaces.map(space => space.spaceId._id)
        // Get ids of second user if space is a chat
        const peerIdsMap = new Map<string, string>()
        spaces.forEach(space => {
            if (space.spaceId.type === SpaceTypesEnum.CHAT) {
                const chat = space.spaceId as ChatI
                const pearId = String(chat.user1_id) === String(userId) ? String(chat.user2_id) : String(chat.user1_id)
                peerIdsMap.set(String(space.spaceId._id), pearId)
            }
        })
        const pearIds = Array.from(peerIdsMap.values())
        // userId to user object
        const usersMap = new Map<string, {img: ImageInfoI[], username: string}>()
        const users = await UserModel.find({_id: {$in: pearIds}}).select<{_id: Types.ObjectId, img: ImageInfoI[], username: string}>("_id img username").lean()
        users.forEach(user => {
            usersMap.set(String(user._id), user)
        })

        // Get last messages in spaces
        const lastMessageMap = new Map<string, LastMessage>()
        const messages = await CommunicationModel.aggregate([
            {$match: {
                spaceId: {$in: spaceIds},
                isConfirmed: true,
                text: { $regex: /^.{2,}/ }
            }},
            {$sort: {createdAt: -1}},
            {$group: {
                _id: "$spaceId",
                text: {$first: "$text"},
                createdAt: {$first: "$createdAt"},
                editedAt: {$first: "$editedAt"}
            }}
        ])
        messages.forEach(message => {
            lastMessageMap.set(String(message._id), {text: message.text, createdAt: message.createdAt, editedAt: message.editedAt})
        })

        for (let space of spaces) {
            if (space.spaceId.type === SpaceTypesEnum.CHAT) {
                const chat = space.spaceId as ChatI
                if (peerIdsMap.get(String(chat._id)) === undefined) continue
                if (usersMap.get(peerIdsMap.get(String(chat._id))!) === undefined) continue
                res.push({
                    id: chat._id.toString(),
                    title: usersMap.get(peerIdsMap.get(String(chat._id))!)!.username,
                    type: SpaceTypesEnum.CHAT,
                    img: usersMap.get(peerIdsMap.get(String(chat._id))!)!.img,
                    updatedAt: chat.updatedAt,
                    createdAt: chat.createdAt,
                    lastMessage: lastMessageMap.get(String(chat._id)) || undefined
                })
            }
        }

        return res
    },

    // async getSpacesList(userId: Types.ObjectId): Promise<SpacesPublicResponse[]> {
    //     let res: SpacesPublicResponse[] = []
    //     let spaces = await SpaceMemberModel.find({userId}).select<{role: SpaceRolesEnum, isMuted: boolean, isBaned: boolean, spaceId: Types.ObjectId}>("role isMuted isBaned spaceId").populate<{ spaceId: BaseSpaceI | ChatI }>("spaceId", " -__v").lean()
    //     for (let space of spaces) {
    //         if (space.spaceId.type === SpaceTypesEnum.CHAT) { 
    //             const chat = space.spaceId as HydratedDocument<ChatI>
    //             const user = await UserModel.findOne({_id: String(chat.user1_id) === String(userId) ? chat.user2_id : chat.user1_id}).select<{img: ImageInfoI[], username: string}>("img username").lean()
    //             if (!user) throw new ErrorWithStatus(404, "User not found")
    //             const lastMessage = await CommunicationModel.findOne({spaceId: space.spaceId._id, isConfirmed: true, text: { $regex: /^.{2,}/ }}).sort({ createdAt: -1 }).select<{text: string}>("text").lean()
                
    //             res.push({
    //                 id: space.spaceId._id.toString(),
    //                 title: user.username,
    //                 type: SpaceTypesEnum.CHAT,
    //                 img: user.img,
    //                 updatedAt: space.spaceId.updatedAt,
    //                 createdAt: space.spaceId.createdAt,
    //                 lastMessage: lastMessage ? lastMessage.text : ""
    //             })
    //         }

    //     }
    //     return res
    // },

    // async deleteSpace(spaceId: Types.ObjectId, userId: Types.ObjectId) {
    //     const space = await SpaceModel.findById(spaceId)
    //     if (!space) throw new ErrorWithStatus(404, "Space not found")
    //     if (space.type === SpaceTypesEnum.POSTS) throw new Error("Not allowed")
    //     const member = await SpaceMemberModel.findOneOrError({spaceId, userId})
    //     if ((member).role !== SpaceRolesEnum.ADMIN) throw new Error("You are not admin")
    //     await SpaceMemberModel.deleteMany({ spaceId });
    //     await space.deleteOne()
    //     return { deleted: true }
    // },

    // async getInfo(spaceId: Types.ObjectId, userId: Types.ObjectId) {
    //     const member = await SpaceMemberModel.findOneOrError({spaceId, userId})
    //     const space = await SpaceModel.findById(spaceId).lean()
    //     if (!space) throw new ErrorWithStatus(404, "Space not found")
    //     if (space.type === SpaceTypesEnum.CHAT) {
    //         const chat = space as unknown as HydratedDocument<ChatI>
    //         const user = await UserModel.findOne({_id: String(chat.user1_id) === String(userId) ? chat.user2_id : chat.user1_id}).select("img username").lean()
    //         if (!user) throw new ErrorWithStatus(404, "User not found")
    //         space.title = user.username
    //         space.img = user.img
    //     }
    //     return space
    // }
}

export default spacesService