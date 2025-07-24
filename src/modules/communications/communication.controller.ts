import { validationWrapper } from "../../common/utils/utils.wrappers";
import { Types } from "mongoose";
import { Server, Socket } from "socket.io";
import { closeCommunicationSchema, createCommunicationSchema, getListCommunicationSchema, updateCommunicationSchema } from "./communication.validation";
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

    async close(data: any, userId: Types.ObjectId, io: Server) {
        const validated = validationWrapper(closeCommunicationSchema, data)
        const communication = await communicationService.close(validated, userId)
        if (communication.isNew) {
            io.to(`chat:${communication.communication.spaceId}`).emit("communication:newMessage", communication.communication)
        }
        return communication.communication
    },

    async update(data: any, userId: Types.ObjectId, io: Server, socket: Socket) {
        const validated = validationWrapper(updateCommunicationSchema, data)
        const communication = await communicationService.update(validated, userId)
        io.to(`chat:${communication.spaceId}`).emit("communication:editMessage", communication)
        return communication
    }
}

export default communicationController