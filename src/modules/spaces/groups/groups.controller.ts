import { validationWrapper } from "../../../common/utils/utils.wrappers";
import { Types } from "mongoose";
import { createGroupDto, createGroupSchema, membersListDto, membersListSchema } from "./groups.dto";
import groupService from "./groups.service";
import { Server } from "socket.io";
import { addSocketToNewSpaceIfOnline } from "../../../socket/socket.utils";
import { SpaceTypesEnum } from "../spaces.types";

const groupController = {
  async createGroup(data: any, userId: Types.ObjectId, io: Server) {
    const dto = validationWrapper<createGroupDto>(createGroupSchema, data || {});
    const groupResponse = await groupService.createGroup(userId, dto);
    addSocketToNewSpaceIfOnline(groupResponse, userId.toString(), io)

    if ((dto.members ?? []).length > 0) {
      await groupController.addMembers({members: dto.members ?? [], spaceId: groupResponse.id}, userId, io)
    }
    
    return groupResponse
  },

  async addMembers(data: any, userId: Types.ObjectId, io: Server) {
    const dto = validationWrapper<membersListDto>(membersListSchema, data || {})
    const newMembers = await groupService.addMembers(userId, dto)

    if (newMembers.length > 1) {
      io.to(`${SpaceTypesEnum.GROUP}:${dto.spaceId}`).emit("space:addMembers", newMembers)
      for (let member of newMembers) {
        addSocketToNewSpaceIfOnline({type: SpaceTypesEnum.GROUP, id: dto.spaceId}, member.id.toString(), io)
      }
    }

    return newMembers 
  }
};

export default groupController;
