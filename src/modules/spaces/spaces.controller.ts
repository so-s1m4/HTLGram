import { validationWrapper } from "../../common/utils/utils.wrappers";
import { Types } from "mongoose";
import { createChatOrGroupOrChanelSchema } from "./spaces.validation";
import spacesService from "./spaces.service";

const spacesController =  {
    async createSpace(data: any, userId: Types.ObjectId) {
        const validated = validationWrapper(createChatOrGroupOrChanelSchema, data|| {})
        return await spacesService.createSpace(validated, userId)
    },

    async getSpacesList(userId: Types.ObjectId) {
        return await spacesService.getSpacesList(userId)
    }

    // async updateSpace() {
        
    // };

    // async deleteSpace() {
        
    // };
}

export default spacesController