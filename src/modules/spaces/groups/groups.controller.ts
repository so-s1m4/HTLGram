import { validationWrapper } from "../../../common/utils/utils.wrappers";
import { Types } from "mongoose";
import { createGroupDto, createGroupSchema } from "./groups.dto";
import groupService from "./groups.service";
import { Server } from "socket.io";
import { addSocketToNewSpaceIfOnline } from "../../../socket/socket.utils";

const groupController = {
  async createGroup(data: any, userId: Types.ObjectId, io: Server) {
    const dto = validationWrapper<createGroupDto>(createGroupSchema, data || {});
    const groupResponse = await groupService.createGroup(userId, dto);

    addSocketToNewSpaceIfOnline(groupResponse, userId.toString(), io)

    return groupResponse
  },
};

export default groupController;
