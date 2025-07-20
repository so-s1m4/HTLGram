import { validationWrapper } from "../../common/utils/utils.wrappers";
import { Types } from "mongoose";
import { deleteSpaceSchema } from "./spaces.validation";
import spacesService from "./spaces.service";

const spacesController =  {
    async getSpacesList(userId: Types.ObjectId) {
        return await spacesService.getSpacesList(userId)
    },

    async deleteSpace(data: any, userId: Types.ObjectId) {
        const validated = validationWrapper(deleteSpaceSchema, data|| {})
        return await spacesService.deleteSpace(validated.spaceId, userId)
    }
}

export default spacesController