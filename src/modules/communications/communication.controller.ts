import { validationWrapper } from "../../common/utils/utils.wrappers";
import { Types } from "mongoose";
import { Server, Socket } from "socket.io";
import { closeCommunicationSchema, createCommunicationSchema, getListCommunicationSchema } from "./communication.validation";
import communicationService from "./communication.service";

const communicationController = {
    async create(data: any, userId: Types.ObjectId, io: Server) {
        const validated = validationWrapper(createCommunicationSchema, data)
        return await communicationService.create(validated, userId)
    },

    async getList(data: any, userId: Types.ObjectId, io: Server) {
        const validated = validationWrapper(getListCommunicationSchema, data)
        return await communicationService.getList(validated, userId)
    },

    async close(data: any, userId: Types.ObjectId, io: Server, socket: Socket) {
        const validated = validationWrapper(closeCommunicationSchema, data)
        const communication = await communicationService.close(validated, userId)
        if (communication.isNew) {
            io.to(`chat:${communication.communication.spaceId}`).emit("communication:newMessage", communication)
        }
        return communication.communication
    }
}

export default communicationController