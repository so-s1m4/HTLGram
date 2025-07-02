import mongoose, { Types } from 'mongoose';
import {friendRequestModel, FriendRequestStatus} from './friends.model'
import { findFriendRequestUtil, findUserUtil } from '../../common/utils/utils.findModel';
import { ErrorWithStatus } from '../../common/middlewares/errorHandlerMiddleware';

export async function createFriendRequest(user_id: Types.ObjectId, receiver_username: string, text: string) {
    const sender = await findUserUtil({_id: user_id})
    const receiver = await findUserUtil({username: receiver_username})
    const idx = sender.friends.findIndex(f => f === receiver_username);
    if (idx !== -1) throw new ErrorWithStatus(400, `${receiver_username} is already your friend`)
    if (sender._id.equals(receiver._id)) throw new ErrorWithStatus(400, "You cant send request to yourself")
    const friendRequest = await friendRequestModel.findOne({$or: [{sender_id: sender._id, receiver_id: receiver._id}, {sender_id: receiver._id, receiver_id: sender._id}]})    
    if (!friendRequest) {
        return await friendRequestModel.create({sender_id: sender._id, sender_username: sender.username, receiver_id: receiver._id, receiver_username: receiver.username, text: text||""})
    } else if (friendRequest.status === 'canceled' || friendRequest.status === 'accepted') {
        friendRequest.status = 'sent'
        if (text) friendRequest.text = text
        await friendRequest.save()
        return friendRequest
    } else {
        throw new ErrorWithStatus(400, `Friend-request was already sent`)
    }
}

export async function updateFriendRequest(request_id: string, user_id: Types.ObjectId, status: FriendRequestStatus) {
    const friendRequest = await findFriendRequestUtil({_id:request_id, status: 'sent', receiver_id:user_id})
    const user = await findUserUtil({_id: user_id})
    if (!friendRequest) throw new ErrorWithStatus(400, "Friend request not found")
    friendRequest.status = status
    await friendRequest.save()
    if (status === "accepted") {
        // const session = await mongoose.startSession();
        // try {
        //     session.startTransaction();

        //     const user1 = await findUserUtil(
        //     { _id: friendRequest.sender_id },
        //     { session }
        //     );
        //     const user2 = await findUserUtil(
        //     { _id: friendRequest.receiver_id },
        //     { session }
        //     );

        //     user1.friends.push(user2.username);
        //     user2.friends.push(user1.username);

        //     await user1.save({ session });
        //     await user2.save({ session });

        //     await session.commitTransaction();
        // } catch (err) {
        //     await session.abortTransaction();
        //     throw err;
        // } finally {
        //     session.endSession();
        // }

        const user1 = await findUserUtil({ _id: friendRequest.sender_id });
        const user2 = await findUserUtil( { _id: friendRequest.receiver_id });

        user1.friends.push(user2.username);
        user2.friends.push(user1.username);

        await user1.save();
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