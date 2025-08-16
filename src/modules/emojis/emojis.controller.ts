import { validationWrapper } from "../../common/utils/utils.wrappers";
import { Types } from "mongoose";
import { emojiGetListDto, emojiGetListSchema, emojiToggleDto, emojiToggleSchema } from "./emojis.dto";
import { Server } from "socket.io";
import emojisService from "./emojis.service";

const emojisController = {
    async getList(data: any, userId: Types.ObjectId, io: Server) {
        const dto = validationWrapper<emojiGetListDto>(emojiGetListSchema, data);
        const emojis = await emojisService.getList(dto);
        return emojis;
    },

    async toggle(data: any, userId: Types.ObjectId, io: Server) {
        const dto = validationWrapper<emojiToggleDto>(emojiToggleSchema, data);
        const emojiResponse = await emojisService.toggle(dto, userId);
        io.to(`space:${emojiResponse.emoji.spaceId}`).emit("emojis:toggle", emojiResponse);
        return emojiResponse
    }
}

export default emojisController;