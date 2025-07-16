import { validationWrapper } from "../../common/utils/utils.wrappers";
import { Types } from "mongoose";
import { createChatOrGroupOrChanelSchema, deleteSpaceSchema, updateSpaceSchema } from "./spaces.validation";
import spacesService from "./spaces.service";

const spacesController =  {
    async createSpace(data: any, userId: Types.ObjectId) {
        const validated = validationWrapper(createChatOrGroupOrChanelSchema, data|| {})
        return await spacesService.createSpace(validated, userId)
    },

    async getSpacesList(userId: Types.ObjectId) {
        return await spacesService.getSpacesList(userId)
    },

    async updateSpace(data: any, userId: Types.ObjectId) {
        const validated = validationWrapper(updateSpaceSchema, data|| {})
        return await spacesService.updateSpace(validated.data, validated.spaceId, userId)
    },

    async deleteSpace(data: any, userId: Types.ObjectId) {
        const validated = validationWrapper(deleteSpaceSchema, data|| {})
        return await spacesService.deleteSpace(validated.spaceId, userId)
    }
}

export default spacesController