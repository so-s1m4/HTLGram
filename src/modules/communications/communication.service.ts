import { Types } from "mongoose"
import { CommunicationModel, PayloadModel } from "./communication.model"
import { SpaceMemberModel } from "./../spaces/spaces.model"
import { ErrorWithStatus } from "./../../common/middlewares/errorHandlerMiddleware"

const communicationService = {
    async getList(data: {spaceId: string, limit: number, skip: number}, userId: Types.ObjectId) {
        const member = await SpaceMemberModel.findOneOrError({userId, spaceId: data.spaceId})
        if (member.isBaned) throw new ErrorWithStatus(403, "You are banned from this chat")
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
    }
}

export default communicationService