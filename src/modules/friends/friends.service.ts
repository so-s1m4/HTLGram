import { Types } from 'mongoose';
import {friendRequestModel, FriendRequestStatus} from './friends.model'
import { findFriendRequest, findUser } from '../../common/utils/utils.findModel';
import { ErrorWithStatus } from '../../common/middlewares/errorHandlerMiddleware';

export async function createFriendRequest(user_id: Types.ObjectId, receiver_username: string) {
    const sender = await findUser({_id: user_id})
    const receiver = await findUser({username: receiver_username})
    if (sender._id.equals(receiver._id)) throw new ErrorWithStatus(400, "You cant send request to yourself")
    const friendRequest = await friendRequestModel.findOne({sender: sender._id, receiver: receiver._id})
    if (!friendRequest) {
        return await friendRequestModel.create({sender: sender._id, receiver: receiver._id})
    } else if (friendRequest.status == 'canceled') {
        friendRequest.status = 'sent'
        await friendRequest.save()
        return friendRequest
    } else if (friendRequest.status == 'accepted') {
        throw new ErrorWithStatus(400, `${receiver_username} is already your friend`)
    } else {
        throw new ErrorWithStatus(400, `Friend-request was already sent`)
    }
}

export async function updateFriendRequest(request_id: string, user_id: Types.ObjectId, status: FriendRequestStatus) {
    const friendRequest = await findFriendRequest({_id:request_id})
    const user = await findUser({_id: user_id})
    if (friendRequest.receiver.equals(user_id)) throw new ErrorWithStatus(400, "You didn't get this request")
    friendRequest.status = status
    await friendRequest.save()
    return friendRequest
}