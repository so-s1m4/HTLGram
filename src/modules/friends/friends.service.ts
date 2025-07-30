import { HydratedDocument, MergeType, Schema, Types } from 'mongoose';
import {FriendRequestI, friendRequestModel, FriendRequestStatus} from './friends.model'
import { ErrorWithStatus } from '../../common/middlewares/errorHandlerMiddleware';
import { friendModel } from './friends.model';
import { UserI, UserModel } from '../../modules/users/users.model';
import { CreateFriendRequestDto, DeleteFriendRequestDto, GetFriendRequestDto, UpdateFriendRequestDto } from './friends.dto';

export type friendDoc = MergeType<HydratedDocument<FriendRequestI>,{ sender_id: HydratedDocument<UserI>; receiver_id: HydratedDocument<UserI> }>

const friendsService = {
    async createFriendRequest(userId: Types.ObjectId, dto: CreateFriendRequestDto): Promise<friendDoc> {
        const sender = await UserModel.findOneOrError({_id: userId})
        const receiver = await UserModel.findOneOrError({_id: dto.receiver})
        const friend = await friendModel.findOne({
            $or: [{user1_id: sender._id, user2_id: receiver._id}, {user2_id: sender._id, user1_id: receiver._id}]
        }).exec()
        if (friend) throw new ErrorWithStatus(400, `${receiver.username} is already your friend`)
        if (String(sender._id) === String(receiver._id)) throw new ErrorWithStatus(400, "You cant send request to yourself")
        const friendRequest = await friendRequestModel.findOne({$or: [{sender_id: sender._id, receiver_id: receiver._id}, {sender_id: receiver._id, receiver_id: sender._id}]})    
        if (!friendRequest) {
            return (await friendRequestModel.create({sender_id: sender._id, receiver_id: receiver._id, text: dto.text || ""})).populate("sender_id receiver_id");
        } else if (friendRequest.status === 'canceled' || friendRequest.status === 'accepted') {
            await friendRequest.deleteOne()
            return (await friendRequestModel.create({sender_id: sender._id, receiver_id: receiver._id, text: dto.text || ""})).populate("sender_id receiver_id");
        } else {
            throw new ErrorWithStatus(400, `Friend-request was already sent`)
        }
    },

    async getFriendRequests(userId: Types.ObjectId, dto: GetFriendRequestDto): Promise<Array<friendDoc>> {
        const requests = await friendRequestModel.find({$or: [
            { receiver_id: userId },
            { sender_id:   userId }
          ], status: dto.status})
          .populate<{ sender_id: HydratedDocument<UserI>, receiver_id: HydratedDocument<UserI> }>("sender_id receiver_id")
          .exec();
        return requests as unknown as friendDoc[];
    },

    async updateFriendRequest(userId: Types.ObjectId, dto: UpdateFriendRequestDto, status: FriendRequestStatus): Promise<friendDoc> {
        const user = await UserModel.findOneOrError({_id: userId})
        const friendRequest = await friendRequestModel.findOneOrError({_id:dto.requestId, status: 'sent', receiver_id:userId})
        friendRequest.status = status
        await friendRequest.save()
        if (status === "accepted") {
            const user1 = await UserModel.findOneOrError({ _id: friendRequest.sender_id });
            const user2 = await UserModel.findOneOrError( { _id: friendRequest.receiver_id });

            await friendModel.create({user1_id: user1._id, user2_id: user2._id})

            user1.friendsCount += 1;
            await user1.save();
            user2.friendsCount += 1;
            await user2.save();
        }
        return friendRequest.populate("sender_id receiver_id") as unknown as friendDoc;
    },

    async deleteFriendRequest(user_id: Types.ObjectId, dto: DeleteFriendRequestDto) {
        const deleted = await friendRequestModel.findOneAndDelete({
        _id: dto.requestId,
        $or: [
          { receiver_id: user_id },
          { sender_id:   user_id }
        ]
        }).populate<{ sender_id: HydratedDocument<UserI>, receiver_id: HydratedDocument<UserI> }>("sender_id receiver_id")
        .exec();

        if (!deleted) {
          throw new ErrorWithStatus(404, 'Friend request not found or access denied');
        }

        return deleted
    }   
}

export default friendsService;