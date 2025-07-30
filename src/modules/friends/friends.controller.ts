import { validationWrapper } from "../../common/utils/utils.wrappers";
import { CreateFriendRequestDto, CreateFriendRequestSchema, DeleteFriendRequestDto, DeleteFriendRequestSchema, GetFriendRequestDto, GetFriendRequestSchema, UpdateFriendRequestDto, UpdateFriendRequestSchema } from "./friends.dto";
import friendsService from "./friends.service";
import { Socket, Server } from "socket.io";
import { Types } from "mongoose";
import {emitToUserIfOnline} from "../../socket"
import { toFriendRequestPublic, toFriendRequestPublicArray } from "./friends.responses";
import e from "express";

// export async function postFriendRequest(req: Request, res: Response, next: NextFunction) {
//     const userId = res.locals.user.userId
//     const data = validationWrapper(createFriendRequestSchema, req.body || {})
//     const friendRequest = await createFriendRequest(userId, data.receiver, data.text)
//     res.status(201).json({data: friendRequest})
// } 

// export async function patchFriendRequest(req: Request, res: Response, next: NextFunction) {
//     const requestId = req.params['requestId']
//     if (!requestId) throw new ErrorWithStatus(400, "'requestId' in params is missing")
//     const userId = res.locals.user.userId
//     const data = validationWrapper(updateFriendRequestSchema, req.body || {})
//     const updated = await updateFriendRequest(requestId, userId, data.status)
//     res.status(200).json({data: updated})
// }

// export async function getFriendRequests(req: Request, res: Response, next: NextFunction) {
//     const userId = res.locals.user.userId
//     const data = validationWrapper(getFriendRequestSchema, req.query || {})
//     const friendRequests = await receiveFriendRequests(data.status, userId)
//     res.status(200).json({data: friendRequests})
// }

// export async function deleteFriendRequest(req: Request, res: Response, next: NextFunction) {
//     const userId = res.locals.user.userId
//     const requestId = req.params['requestId']
//     if (!requestId) throw new ErrorWithStatus(400, "'requestId' in params is missing")
//     const deleted = await removeFriendRequest(userId, requestId)
//     res.status(200).json({data: deleted})
// }

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