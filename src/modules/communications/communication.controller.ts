import { validationWrapper } from "../../common/utils/utils.wrappers";
import { Types } from "mongoose";
import { Server, Socket } from "socket.io";
import { closeCommunicationSchema, createCommunicationSchema, deleteMediaCommunicationSchema, deleteMessagesCommunicationSchema, getListCommunicationSchema, updateCommunicationSchema } from "./communication.validation";
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

    async deleteMedias(data: any, userId: Types.ObjectId, io: Server, socket: Socket) {
        const validated = validationWrapper(deleteMediaCommunicationSchema, data)
        const medias = await communicationService.deleteMedias(validated, userId)
        for (let media of medias) {
            io.to(`chat:${media.communicationId.spaceId}`).emit("communication:deleteMedia", media)
        }
        return medias  
    },

    async deleteMessages(data: any, userId: Types.ObjectId, io: Server, socket: Socket) {
        const validated = validationWrapper(deleteMessagesCommunicationSchema, data)
        const messages = await communicationService.deleteMessages(validated, userId)
        for (let message of messages) {
            io.to(`chat:${message.spaceId}`).emit("communication:deleteMessage", message)
        }
        return messages  
    }
}

export default communicationController