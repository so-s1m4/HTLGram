import { validationWrapper } from "../../../common/utils/utils.wrappers";
import { Types } from "mongoose";
import { Server, Socket } from "socket.io";
import { createCommunicationSchema, deleteMediaCommunicationSchema, deleteMessagesCommunicationSchema, updateCommunicationSchema } from "./chats.validation";
import chatService from "./chats.service";

const chatController = {
    async create(data: any, userId: Types.ObjectId, io: Server) {
        const validated = validationWrapper(createCommunicationSchema, data)
        return await chatService.create(validated, userId)
    },

    async update(data: any, userId: Types.ObjectId, io: Server, socket: Socket) {
        const validated = validationWrapper(updateCommunicationSchema, data)
        const communication = await chatService.update(validated, userId)
        socket.broadcast.to(`chat:${communication.spaceId}`).emit("communication:editMessage", communication)
        return communication
    },

    async deleteMedias(data: any, userId: Types.ObjectId, io: Server, socket: Socket) {
        const validated = validationWrapper(deleteMediaCommunicationSchema, data)
        const medias = await chatService.deleteMedias(validated, userId)
        for (let media of medias) {
            io.to(`chat:${media.communicationId.spaceId}`).emit("communication:deleteMedia", media)
        }
        return medias  
    },

    async deleteMessages(data: any, userId: Types.ObjectId, io: Server, socket: Socket) {
        const validated = validationWrapper(deleteMessagesCommunicationSchema, data)
        const messages = await chatService.deleteMessages(validated, userId)
        for (let message of messages) {
            io.to(`chat:${message.spaceId}`).emit("communication:deleteMessage", message)
        }
        return messages  
    }
}

export default chatController