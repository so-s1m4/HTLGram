import { validationWrapper } from "../../../common/utils/utils.wrappers"
import { Types } from "mongoose"
import { createChatDto, createChatSchema } from "./chats.dto"
import chatsService from "./chats.service"
import { Server } from "socket.io";
import { addSocketToNewSpaceIfOnline } from "../../../socket/socket.utils";

const chatsController = {
    async createChat(data: any, userId: Types.ObjectId, io: Server) {
        const dto = validationWrapper<createChatDto>(createChatSchema, data || {})
        const chatResponse =  await chatsService.createChat(userId, dto.userId)
        if (chatResponse.isNew) {
            addSocketToNewSpaceIfOnline(chatResponse.chat, userId.toString(), io)
            addSocketToNewSpaceIfOnline(chatResponse.chat, dto.userId.toString(), io)
        }
        return chatResponse
        
    }
}

export default chatsController