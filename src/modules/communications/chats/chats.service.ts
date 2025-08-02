import { Types } from "mongoose"
import { CommunicationModel, PayloadModel } from "../communication.model"
import { ChatModel, SpaceMemberModel } from "../../spaces/spaces.model"
import { ErrorWithStatus } from "../../../common/middlewares/errorHandlerMiddleware"
import { config } from "../../../config/config"
import { deleteMediaCommunicationSchemaI, deleteMessagesCommunicationSchemaI } from "./chats.validation"
import { CommunicationI } from "../communication.types"
import getServerJWT from "../../../common/utils/utils.getServersJWT"
import { UserModel } from "../../users/users.model"

const chatService = {
    async create(data: any, userId: Types.ObjectId) {
        const member = await SpaceMemberModel.findOneOrError({userId, spaceId: data.spaceId})
        if (data.repliedOn) {
            const repliedOn = await CommunicationModel.findOneOrError({_id: data.repliedOn, spaceId: data.spaceId})
            if (!repliedOn.isConfirmed) throw new ErrorWithStatus(400, "You need to close communication first")
        }
        const communication = await CommunicationModel.create({
            ...data,
            senderId: userId,
            expiresAt: new Date(Date.now() + config.TIME_TO_DELETE_COMMUNICATION * 60 * 1000),
            editedAt: new Date()
        })
        return communication
    },

    async update(data: {communicationId: string, text: string}, userId: Types.ObjectId) {
        const communication = await CommunicationModel.findOneOrError({_id: data.communicationId, senderId: userId})
        if (!communication.isConfirmed) throw new ErrorWithStatus(400, "You need to close communication first")
        communication.text = data.text
        communication.editedAt = new Date()
        await communication.save()
        return communication
    },

    async deleteMedias(data: deleteMediaCommunicationSchemaI, userId: Types.ObjectId) {
        let medias = []
        let user_storage = new Map<string, number>()

        for (let mediaId of data.media) {
            const media = await PayloadModel.findOne({_id: mediaId}).populate<{ communicationId: CommunicationI }>("communicationId").exec()
            if (!media) throw new ErrorWithStatus(404, "Media don't found")
            if (!media.communicationId) throw new ErrorWithStatus(404, "Communication not found")
            if (!media.communicationId.isConfirmed) throw new ErrorWithStatus(404, "You need to close communications first")
            const member = await SpaceMemberModel.findOne({spaceId: media.communicationId.spaceId, userId}).exec()
            if (!member) throw new ErrorWithStatus(403, "You are not in this chat")
            medias.push(media)
            const ownerId = media.owner.toString();
            const prev = user_storage.get(ownerId) || 0;
            user_storage.set(ownerId, prev + media.size);
        }

        const res = await fetch(config.MEDIA_SERVER+"/media", {
            "method":"DELETE",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer "+getServerJWT()
            },
            "body": JSON.stringify({
                media: medias.map(i => i._id.toString())
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
            _id: { $in: medias.map(m => m._id) }
        }).exec()

        return medias
    },

    async deleteMessages(data: deleteMessagesCommunicationSchemaI, userId: Types.ObjectId) {
        let communications = []
        for (let communicationId of data.messages) {
            const communication = await CommunicationModel.findOneOrError({_id: communicationId})            
            const user = await SpaceMemberModel.findOneOrError({spaceId: communication.spaceId, userId})
            const repliedMessages = CommunicationModel.updateMany({repliedOn: communicationId, spaceId: communication.spaceId}, {repliedOn: null}).exec()
            let payloadIds = (await PayloadModel.find({communicationId: communicationId}).select("_id").lean()).map(i => String(i._id))
            if (payloadIds.length > 0) {
                await this.deleteMedias({ media: payloadIds }, userId)
            }
            communications.push(communication)
            await communication.deleteOne()
        }
        return communications
    }
}

export default chatService