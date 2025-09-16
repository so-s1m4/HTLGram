import { validationWrapper } from "../../common/utils/utils.wrappers";
import { CreateFriendRequestDto, CreateFriendRequestSchema, DeleteFriendRequestDto, DeleteFriendRequestSchema, GetFriendRequestDto, GetFriendRequestSchema, UpdateFriendRequestDto, UpdateFriendRequestSchema } from "./friends.dto";
import friendsService from "./friends.service";
import { Socket, Server } from "socket.io";
import { Types } from "mongoose";
import { emitToUserIfOnline } from "../../socket/socket.utils"
import { toFriendRequestPublic, toFriendRequestPublicArray } from "./friends.responses";
import e from "express";

const friendsController = {
    async createFriendRequest(data: any, userId: Types.ObjectId, io: Server, socket: Socket) {
        const dto = validationWrapper<CreateFriendRequestDto>(CreateFriendRequestSchema, data || {})
        const friendRequest = await friendsService.createFriendRequest(userId, dto)
        const friendRequestPublic = toFriendRequestPublic(friendRequest);
        emitToUserIfOnline(friendRequest.receiver_id.id, "friends:newRequest", friendRequestPublic, io)
        emitToUserIfOnline(friendRequest.sender_id.id, "friends:newRequest", friendRequestPublic, io)
        return friendRequestPublic;
    },

    async getFriendRequests(data: any, userId: Types.ObjectId, io: Server, socket: Socket) {
        const dto = validationWrapper<GetFriendRequestDto>(GetFriendRequestSchema, data || {})
        const friendRequests = await friendsService.getFriendRequests(userId, dto)
        const friendRequestsPublic = toFriendRequestPublicArray(friendRequests);
        return friendRequestsPublic;
    },

    async cancelRequest(data: any, userId: Types.ObjectId, io: Server, socket: Socket) {
        const dto = validationWrapper<UpdateFriendRequestDto>(UpdateFriendRequestSchema, data || {})
        const friendRequest = await friendsService.updateFriendRequest(userId, dto, "canceled")
        const friendRequestPublic = toFriendRequestPublic(friendRequest);
        emitToUserIfOnline(friendRequestPublic.sender_id.id, "friends:requestCanceled", friendRequestPublic, io)
        emitToUserIfOnline(friendRequestPublic.receiver_id.id, "friends:requestCanceled", friendRequestPublic, io)
        return friendRequestPublic;
    },

    async acceptRequest(data: any, userId: Types.ObjectId, io: Server, socket: Socket) {
        const dto = validationWrapper<UpdateFriendRequestDto>(UpdateFriendRequestSchema, data || {})
        const friendRequest = await friendsService.updateFriendRequest(userId, dto, "accepted")
        const friendRequestPublic = toFriendRequestPublic(friendRequest);
        emitToUserIfOnline(friendRequestPublic.sender_id.id, "friends:requestAccepted", friendRequestPublic, io)
        emitToUserIfOnline(friendRequestPublic.receiver_id.id, "friends:requestAccepted", friendRequestPublic, io)
        return friendRequestPublic;
    },

    async deleteFriendRequest(data: any, userId: Types.ObjectId, io: Server, socket: Socket) {
        const dto = validationWrapper<DeleteFriendRequestDto>(DeleteFriendRequestSchema, data || {})
        const friendRequest = await friendsService.deleteFriendRequest(userId, dto)
        const friendRequestPublic = toFriendRequestPublic(friendRequest as any)
        emitToUserIfOnline(friendRequestPublic.sender_id.id, "friends:requestDeleted", friendRequestPublic, io)
        emitToUserIfOnline(friendRequestPublic.receiver_id.id, "friends:requestCanceled", friendRequestPublic, io)
        return friendRequestPublic;
    }
};

export default friendsController;