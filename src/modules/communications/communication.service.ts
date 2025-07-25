import { NumberSchemaDefinition, Types } from "mongoose"
import { CommunicationModel } from "./communication.model"
import { SpaceMemberModel } from "../../modules/spaces/spaces.model"
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware"

const communicationService = {
    async create(data: any, userId: Types.ObjectId) {
        const member = await SpaceMemberModel.findOneOrError({userId, spaceId: data.spaceId})
        const communication = await CommunicationModel.create({
            ...data,
            senderId: userId,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            editedAt: new Date()
        })
        return communication
    },

    async getList(data: {spaceId: string, limit: number, skip: number}, userId: Types.ObjectId) {
        const member = await SpaceMemberModel.findOneOrError({userId, spaceId: data.spaceId})
        const communication = await CommunicationModel.find({spaceId: data.spaceId, isConfirmed: true}).sort({ createdAt: -1 }).populate("senderId").skip(data.skip).limit(data.limit).lean()
        return communication
    },

    async close(data: {communicationId: string}, userId: Types.ObjectId) {
        const communication = await CommunicationModel.findOne({_id: data.communicationId, senderId: userId}).populate("senderId")
        if (!communication) throw new ErrorWithStatus(404, "Communication not found")
        if (communication.isConfirmed) return {communication, isNew: false}
        communication.isConfirmed = true
        await communication.save()
        return {communication, isNew: true}
    },

    async update(data: {communicationId: string, text: string}, userId: Types.ObjectId) {
        const communication = await CommunicationModel.findOneOrError({_id: data.communicationId, senderId: userId})
        if (!communication.isConfirmed) throw new ErrorWithStatus(400, "You need to close communication first")
        communication.text = data.text
        communication.editedAt = new Date()
        await communication.save()
        return communication
    }
}

export default communicationService