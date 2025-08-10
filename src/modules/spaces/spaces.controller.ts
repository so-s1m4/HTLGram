import { validationWrapper } from "../../common/utils/utils.wrappers";
import { Types } from "mongoose";
import { deleteSpaceDto, deleteSpaceSchema, getInfoSpaceDto, getInfoSpaceSchema, readMessagesDto, readMessagesSchema } from "./spaces.dto";
import spacesService from "./spaces.service";
import { Server } from "socket.io";

const spacesController =  {
    async getSpacesList(userId: Types.ObjectId) {
        return await spacesService.getSpacesList(userId)
    },

    async deleteSpace(data: any, userId: Types.ObjectId, io: Server) {
        const dto = validationWrapper<deleteSpaceDto>(deleteSpaceSchema, data|| {})
        const space =  await spacesService.deleteSpace(dto.spaceId, userId)
        io.to(`chat:${space.spaceId}`).emit("space:deleted", space)
        return space
    },

    async getInfo(data: any, userId: Types.ObjectId) {
        const dto = validationWrapper<getInfoSpaceDto>(getInfoSpaceSchema, data || {})
        return await spacesService.getInfo(dto.spaceId, userId)
    },
    
    async readMessages(data: any, userId: Types.ObjectId, io: Server) {
        const dto = validationWrapper<readMessagesDto>(readMessagesSchema, data || {})
        const readMessages = await spacesService.readMessages(dto, userId)
        io.to(`chat:${dto.spaceId}`).emit("space:readMessages", readMessages)
        return readMessages
    }
}

export default spacesController