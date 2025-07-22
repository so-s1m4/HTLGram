import { validationWrapper } from "../../../common/utils/utils.wrappers"
import { Types } from "mongoose"
import { createChatSchema } from "./chats.validation"
import chatsService from "./chats.service"
import { Server } from "socket.io";
import { addSocketToNewSpaceIfOnline } from "../../../socket";
import { BaseSpaceI } from "../spaces.types";

const chatsController = {
    async createChat(data: any, userId: Types.ObjectId, io: Server) {
        const validated = validationWrapper(createChatSchema, data || {})
        const {chat, isNew} =  await chatsService.createChat(userId, validated.userId)
        
        if (isNew) {
            addSocketToNewSpaceIfOnline(chat as unknown as BaseSpaceI, userId.toString(), io)
            addSocketToNewSpaceIfOnline(chat as unknown as BaseSpaceI, validated.userId.toString(), io)
        }

        return chat
        
    }
}

export default chatsController