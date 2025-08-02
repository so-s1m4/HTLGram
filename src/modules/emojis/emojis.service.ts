import { emojiGetListDto } from "./emojis.dto";
import { EmojiModel } from "./emojis.model";

const emojisService = {
    async getList(data: emojiGetListDto) {
        const emojis = await EmojiModel.find({}).skip(data.offset).limit(data.limit).exec();
        return emojis
    }
}

export default emojisService;