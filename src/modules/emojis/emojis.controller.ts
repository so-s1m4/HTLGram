import { validationWrapper } from "../../common/utils/utils.wrappers";
import { Types } from "mongoose";
import { emojiGetListSchema } from "./emojis.dto";
import { Server } from "socket.io";
import { toEmojiResponseArray } from "./emojis.response";
import emojisService from "./emojis.service";

const emojisController = {
    async getList(data: any, userId: Types.ObjectId, io: Server) {
        const dto = validationWrapper(emojiGetListSchema, data);
        const emojis = await emojisService.getList(dto);
        return toEmojiResponseArray(emojis);
    }
}

export default emojisController;