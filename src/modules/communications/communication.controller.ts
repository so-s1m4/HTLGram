import { validationWrapper } from "../../common/utils/utils.wrappers";
import { Types } from "mongoose";
import { Server } from "socket.io";
import { closeCommunicationSchema, getListCommunicationSchema } from "./communication.validation";
import communicationService from "./communication.service";

const communicationController = {
    async getList(data: any, userId: Types.ObjectId, io: Server) {
        const validated = validationWrapper(getListCommunicationSchema, data)
        return await communicationService.getList(validated, userId)
    },

    async close(data: any, userId: Types.ObjectId, io: Server) {
        const validated = validationWrapper(closeCommunicationSchema, data)
        const communication = await communicationService.close(validated, userId)
        if (communication.isNew) {
            io.to(`chat:${communication.communication.spaceId}`).emit("communication:newMessage", communication.communication)
        }
        return communication.communication
    }
}

export default communicationController