import { Schema, Types } from 'mongoose';
import {friendRequestModel, FriendRequestStatus} from './friends.model'
import { ErrorWithStatus } from '../../common/middlewares/errorHandlerMiddleware';
import { friendModel } from './friends.model';
import { UserModel } from '../../modules/users/users.model';

export async function createFriendRequest(user_id: Types.ObjectId, receiver_username: string, text: string) {
    const sender = await UserModel.findOneOrError({_id: user_id})
    const receiver = await UserModel.findOneOrError({username: receiver_username})
    const friend = await friendModel.findOne({
        $or: [{user1_id: sender._id, user2_id: receiver._id}, {user2_id: sender._id, user1_id: receiver._id}]
    }).exec()
    if (friend) throw new ErrorWithStatus(400, `${receiver_username} is already your friend`)
    if (String(sender._id) === String(receiver._id)) throw new ErrorWithStatus(400, "You cant send request to yourself")
    const friendRequest = await friendRequestModel.findOne({$or: [{sender_id: sender._id, receiver_id: receiver._id}, {sender_id: receiver._id, receiver_id: sender._id}]})    
    if (!friendRequest) {
        return await friendRequestModel.create({sender_id: sender._id, sender_username: sender.username, receiver_id: receiver._id, receiver_username: receiver.username, text: text||""})
    } else if (friendRequest.status === 'canceled' || friendRequest.status === 'accepted') {
        await friendRequest.deleteOne()
        return await friendRequestModel.create({sender_id: sender._id, sender_username: sender.username, receiver_id: receiver._id, receiver_username: receiver.username, text: text||""})
    } else {
        throw new ErrorWithStatus(400, `Friend-request was already sent`)
    }
}

export async function updateFriendRequest(request_id: string, user_id: Types.ObjectId, status: FriendRequestStatus) {
    const user = await UserModel.findOneOrError({_id: user_id})
    const friendRequest = await friendRequestModel.findOneOrError({_id:request_id, status: 'sent', receiver_id:user_id})
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
    return friendRequest
}

export async function receiveFriendRequests(status: FriendRequestStatus, user_id: Types.ObjectId) {
    const requests = await friendRequestModel.find({$or: [
        { receiver_id: user_id },
        { sender_id:   user_id }
      ], status}).exec()
    return requests
}

export async function removeFriendRequest(user_id: Types.ObjectId, request_id: string) {
    const deleted = await friendRequestModel.findOneAndDelete({
    _id: request_id,
    $or: [
      { receiver_id: user_id },
      { sender_id:   user_id }
    ]
    }).exec();

    if (!deleted) {
      throw new ErrorWithStatus(404, 'Friend request not found or access denied');
    }

    return deleted
}   