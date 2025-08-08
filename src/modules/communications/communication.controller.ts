import { validationWrapper } from "../../common/utils/utils.wrappers";
import { Types } from "mongoose";
import { Server, Socket } from "socket.io";
import { closeCommunicationDto, closeCommunicationSchema, createCommunicationDto, createCommunicationSchema, deleteMediaCommunicationDto, deleteMediaCommunicationSchema, deleteMessagesCommunicationDto, deleteMessagesCommunicationSchema, getLIstCommunicationDto, getListCommunicationSchema, updateCommunicationDto, updateCommunicationSchema } from "./communication.dto";
import communicationService from "./communication.service";

const communicationController = {
    async getList(data: any, userId: Types.ObjectId, io: Server) {
        const dto = validationWrapper<getLIstCommunicationDto>(getListCommunicationSchema, data)
        return await communicationService.getList(dto, userId)
    },

    async close(data: any, userId: Types.ObjectId, io: Server) {
        const dto = validationWrapper<closeCommunicationDto>(closeCommunicationSchema, data)
        const communication = await communicationService.close(dto, userId)
        if (communication.isNew) {
            io.to(`chat:${communication.communication.spaceId}`).emit("communication:newMessage", communication.communication)
        }
        return communication.communication
    },

    async create(data: any, userId: Types.ObjectId, io: Server) {
        const dto = validationWrapper<createCommunicationDto>(createCommunicationSchema, data)
        return await communicationService.create(dto, userId)
    },

    async update(data: any, userId: Types.ObjectId, io: Server, socket: Socket) {
        const dto = validationWrapper<updateCommunicationDto>(updateCommunicationSchema, data)
        const communication = await communicationService.update(dto, userId)
        socket.broadcast.to(`chat:${communication.spaceId}`).emit("communication:editMessage", communication)
        return communication
    },

    async deleteMedias(data: any, userId: Types.ObjectId, io: Server, socket: Socket) {
        const dto = validationWrapper<deleteMediaCommunicationDto>(deleteMediaCommunicationSchema, data)
        const medias = await communicationService.deleteMedias(dto, userId)
        for (let media of medias) {
            io.to(`chat:${media.spaceId}`).emit("communication:deleteMedia", media)
        }
        return medias  
    },

    async deleteMessages(data: any, userId: Types.ObjectId, io: Server, socket: Socket) {
        const dto = validationWrapper<deleteMessagesCommunicationDto>(deleteMessagesCommunicationSchema, data)
        const messages = await communicationService.deleteMessages(dto, userId)
        for (let message of messages) {
            io.to(`chat:${message.spaceId}`).emit("communication:deleteMessage", message)
        }
        return messages  
    }
    
}

export default communicationController