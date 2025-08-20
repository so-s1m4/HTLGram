import { validationWrapper } from "../../common/utils/utils.wrappers";
import { Types } from "mongoose";
import { deleteSpaceDto, deleteSpaceSchema, getInfoSpaceDto, getInfoSpaceSchema, getMembersDto, getMembersSchema, readMessagesDto, readMessagesSchema, togleAdminDto, togleAdminSchema } from "./spaces.dto";
import spacesService from "./spaces.service";
import { Server } from "socket.io";

const spacesController =  {
    async getSpacesList(userId: Types.ObjectId) {
        return await spacesService.getSpacesList(userId)
    },

    async deleteSpace(data: any, userId: Types.ObjectId, io: Server) {
        const dto = validationWrapper<deleteSpaceDto>(deleteSpaceSchema, data|| {})
        const space =  await spacesService.deleteSpace(dto.spaceId, userId)
        io.to(`space:${space.spaceId}`).emit("space:deleted", space)
        return space
    },

    async getInfo(data: any, userId: Types.ObjectId) {
        const dto = validationWrapper<getInfoSpaceDto>(getInfoSpaceSchema, data || {})
        return await spacesService.getInfo(dto.spaceId, userId)
    },
    
    async readMessages(data: any, userId: Types.ObjectId, io: Server) {
        const dto = validationWrapper<readMessagesDto>(readMessagesSchema, data || {})
        const readMessages = await spacesService.readMessages(dto, userId)
        io.to(`space:${dto.spaceId}`).emit("space:readMessages", readMessages)
        return readMessages
    },

    async getMembers(data: any, userId: Types.ObjectId, io: Server) {
        const dto = validationWrapper<getMembersDto>(getMembersSchema, data || {})
        const members = await spacesService.getMembers(dto, userId)
        return members
    },

    async addAdmin(data: any, userId: Types.ObjectId, io: Server) {
        const dto = validationWrapper<togleAdminDto>(togleAdminSchema, data || {})
        const member = await spacesService.addAdmin(dto, userId)
        io.to(`space:${dto.spaceId}`).emit("space:addedAdmin", member)
        return member
    },

    async removeAdmin(data: any, userId: Types.ObjectId, io: Server) {
        const dto = validationWrapper<togleAdminDto>(togleAdminSchema, data || {})
        const member = await spacesService.removeAdmin(dto, userId)
        io.to(`space:${dto.spaceId}`).emit("space:removedAdmin", member)
        return member
    }
}

export default spacesController