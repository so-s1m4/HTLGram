import { validationWrapper } from "../../common/utils/utils.wrappers";
import { Types } from "mongoose";
import { deleteSpaceDto, deleteSpaceSchema, getInfoSpaceDto, getInfoSpaceSchema } from "./spaces.dto";
import spacesService from "./spaces.service";

const spacesController =  {
    async getSpacesList(userId: Types.ObjectId) {
        return await spacesService.getSpacesList(userId)
    },

    async deleteSpace(data: any, userId: Types.ObjectId) {
        const validated = validationWrapper<deleteSpaceDto>(deleteSpaceSchema, data|| {})
        return await spacesService.deleteSpace(validated.spaceId, userId)
    },

    async getInfo(data: any, userId: Types.ObjectId) {
        const validated = validationWrapper<getInfoSpaceDto>(getInfoSpaceSchema, data || {})
        return await spacesService.getInfo(validated.spaceId, userId)
    }
}

export default spacesController