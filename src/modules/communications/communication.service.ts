import { NumberSchemaDefinition, Types } from "mongoose"
import { CommunicationModel, PayloadModel } from "./communication.model"
import { SpaceMemberModel } from "../../modules/spaces/spaces.model"
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware"
import { config } from "../../config/config"
import { deleteMediaCommunicationSchemaI } from "./communication.validation"
import { CommunicationI } from "./communication.types"
import { userModel } from "modules/users/users.model"

const communicationService = {
    async create(data: any, userId: Types.ObjectId) {
        const member = await SpaceMemberModel.findOneOrError({userId, spaceId: data.spaceId})
        const communication = await CommunicationModel.create({
            ...data,
            senderId: userId,
            expiresAt: new Date(Date.now() + config.TIME_TO_DELETE_COMMUNICATION * 60 * 1000),
            editedAt: new Date()
        })
        return communication
    },

    async getList(data: {spaceId: string, limit: number, skip: number}, userId: Types.ObjectId) {
        const member = await SpaceMemberModel.findOneOrError({userId, spaceId: data.spaceId})
        const communications = await CommunicationModel.find({spaceId: data.spaceId, isConfirmed: true}).sort({ createdAt: -1 }).populate("senderId").skip(data.skip).limit(data.limit).lean()
        for (let communication of communications) {
            const media = await PayloadModel.find({communicationId: communication._id})
            communication.media = media
        }
        return communications
    },

    async close(data: {communicationId: string}, userId: Types.ObjectId) {
        const communication = await CommunicationModel.findOne({_id: data.communicationId, senderId: userId}).populate("senderId")
        if (!communication) throw new ErrorWithStatus(404, "Communication not found")

        if (communication.isConfirmed) {
            const commObj = communication.toObject();
            commObj.media = await PayloadModel.find({ communicationId: commObj._id });
            return { communication: commObj, isNew: false };
        }

        communication.isConfirmed = true;
        await communication.save();

        const commObj = communication.toObject();
        commObj.media = await PayloadModel.find({ communicationId: commObj._id });
        return { communication: commObj, isNew: true };
    },

    async update(data: {communicationId: string, text: string}, userId: Types.ObjectId) {
        const communication = await CommunicationModel.findOneOrError({_id: data.communicationId, senderId: userId})
        if (!communication.isConfirmed) throw new ErrorWithStatus(400, "You need to close communication first")
        communication.text = data.text
        communication.editedAt = new Date()
        await communication.save()
        return communication
    },

    async deleteMedia(data: deleteMediaCommunicationSchemaI, userId: Types.ObjectId) {
        const media = await PayloadModel.findOne({_id: data.mediaId}).populate<{ communicationId: CommunicationI }>("communicationId").exec()
        if (!media) throw new ErrorWithStatus(404, "Media don't found")
        if (!media.communicationId) throw new ErrorWithStatus(404, "Communication not found")
        const member = await SpaceMemberModel.findOne({spaceId: media.communicationId.spaceId, userId})
        if (!member) throw new ErrorWithStatus(404, "You are not in this chat")
        const res = await fetch(config.MEDIA_SERVER+"/media", {
            "method":"DELETE",
            "headers": {
                "Content-Type": "application/json",
            },
            "body": JSON.stringify({
                mediaId: String(media._id)
            }),
        })

        if (!res.ok) {
            throw new ErrorWithStatus(res.status, "Media server error");
        }
        const user = await userModel.findOneOrError({_id: media.owner})
        user.storage -= media.size
        await user.save()
        await media.deleteOne()
        return media
    }
}

export default communicationService