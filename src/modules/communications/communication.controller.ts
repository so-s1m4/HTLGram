import { validationWrapper } from "../../common/utils/utils.wrappers";
import { Types } from "mongoose";
import { Server, Socket } from "socket.io";
import { closeCommunicationSchema, createCommunicationSchema, deleteMediaCommunicationSchema, getListCommunicationSchema, updateCommunicationSchema } from "./communication.validation";
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
        socket.broadcast.to(`chat:${communication.spaceId}`).emit("communication:editMessage", communication)
        return communication
    },

    async deleteMedia(data: any, userId: Types.ObjectId, io: Server, socket: Socket) {
        const validated = validationWrapper(deleteMediaCommunicationSchema, data)
        const media = await communicationService.deleteMedia(validated, userId)
        io.to(`chat:${media.communicationId.spaceId}`).emit("communication:deleteMedia", media)
        return media
        
    }
}

export default communicationController