import { Types } from 'mongoose';
import {friendRequestModel, FriendRequestStatus} from './friends.model'
import { findFriendRequestUtil, findUserUtil } from '../../common/utils/utils.findModel';
import { ErrorWithStatus } from '../../common/middlewares/errorHandlerMiddleware';

export async function createFriendRequest(user_id: Types.ObjectId, receiver_username: string, text: string) {
    const sender = await findUserUtil({_id: user_id})
    const receiver = await findUserUtil({username: receiver_username})
    if (sender._id.equals(receiver._id)) throw new ErrorWithStatus(400, "You cant send request to yourself")
    const friendRequest = await friendRequestModel.findOne({$or: [{sender: sender._id, receiver: receiver._id}, {sender: receiver._id, receiver: sender._id}]})    
    if (!friendRequest) {
        return await friendRequestModel.create({sender: sender._id, sender_username: sender.username, receiver: receiver._id, receiver_username: receiver.username, text: text||""})
    } else if (friendRequest.status === 'canceled') {
        friendRequest.status = 'sent'
        if (text) friendRequest.text = text
        await friendRequest.save()
        return friendRequest
    } else if (friendRequest.status === 'accepted') {
        throw new ErrorWithStatus(400, `${receiver_username} is already your friend`)
    } else {
        throw new ErrorWithStatus(400, `Friend-request was already sent`)
    }
}

export async function updateFriendRequest(request_id: string, user_id: Types.ObjectId, status: FriendRequestStatus) {
    const friendRequest = await findFriendRequestUtil({_id:request_id})
    const user = await findUserUtil({_id: user_id})
    if (!friendRequest.receiver.equals(user_id)) throw new ErrorWithStatus(400, "You didn't get this request")
    friendRequest.status = status
    await friendRequest.save()
    return friendRequest
}

export async function receiveFriendRequests(status: FriendRequestStatus, user_id: Types.ObjectId) {
    const requests = await friendRequestModel.find({$or: [
        { receiver: user_id },
        { sender:   user_id }
      ], status}).exec()
    return requests
}

export async function removeFriendRequest(user_id: Types.ObjectId, request_id: string) {
    const deleted = await friendRequestModel.findOneAndDelete({
    _id: request_id,
    $or: [
      { receiver: user_id },
      { sender:   user_id }
    ]
  }).exec();

  if (!deleted) {
    throw new ErrorWithStatus(404, 'Friend request not found or access denied');
  }

  return deleted
}