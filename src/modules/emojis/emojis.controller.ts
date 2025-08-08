import { validationWrapper } from "../../common/utils/utils.wrappers";
import { Types } from "mongoose";
import { emojiGetListDto, emojiGetListSchema, emojiToggleDto, emojiToggleSchema } from "./emojis.dto";
import { Server } from "socket.io";
import { toEmojiCommunicationResponse, toEmojiCommunicationWithActionResponse, toEmojiResponseArray } from "./emojis.response";
import emojisService from "./emojis.service";

const emojisController = {
    async getList(data: any, userId: Types.ObjectId, io: Server) {
        const dto = validationWrapper<emojiGetListDto>(emojiGetListSchema, data);
        const emojis = await emojisService.getList(dto);
        return toEmojiResponseArray(emojis);
    },

    async toggle(data: any, userId: Types.ObjectId, io: Server) {
        const dto = validationWrapper<emojiToggleDto>(emojiToggleSchema, data);
        const emojiAction = await emojisService.toggle(dto, userId);
        const emojiResponse = toEmojiCommunicationWithActionResponse(emojiAction.emoji, emojiAction.action);
        io.to(`chat:${emojiResponse.emoji.communicationId.spaceId}`).emit("emojis:toggle", emojiResponse);
        return emojiResponse
    }
}

export default emojisController;