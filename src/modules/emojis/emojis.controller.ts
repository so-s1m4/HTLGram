import { validationWrapper } from "../../common/utils/utils.wrappers";
import { Types } from "mongoose";
import { emojiGetListSchema, emojiToggleSchema } from "./emojis.dto";
import { Server } from "socket.io";
import { toEmojiCommunicationResponse, toEmojiResponseArray } from "./emojis.response";
import emojisService from "./emojis.service";

const emojisController = {
    async getList(data: any, userId: Types.ObjectId, io: Server) {
        const dto = validationWrapper(emojiGetListSchema, data);
        const emojis = await emojisService.getList(dto);
        return toEmojiResponseArray(emojis);
    },

    async toggle(data: any, userId: Types.ObjectId, io: Server) {
        const dto = validationWrapper(emojiToggleSchema, data);
        const emojiAction = await emojisService.toggle(dto, userId);
        const emojiResponse = toEmojiCommunicationResponse(emojiAction);
        io.to(`chat:${emojiResponse.emoji.communicationId.spaceId}`).emit("emojis:toggle", emojiResponse);
        return emojiResponse
    }
}

export default emojisController;