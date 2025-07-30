import { toUserPublic, UserPublicR } from "../../modules/users/users.responses";
import { FriendRequestI, FriendRequestStatus } from "./friends.model";
import { UserI } from "../../modules/users/users.model";
import { MergeType, HydratedDocument } from "mongoose";
import { friendDoc } from "./friends.service";

export type FriendRequestPublicR = {
    id: string;
    sender_id: UserPublicR;
    receiver_id: UserPublicR;
    status: FriendRequestStatus;
    text?: string;
    createdAt: Date;
    updatedAt: Date;
};

export function toFriendRequestPublic(friendRequest: friendDoc): FriendRequestPublicR {
    return {
        id: String(friendRequest._id),
        sender_id: toUserPublic(friendRequest.sender_id),
        receiver_id: toUserPublic(friendRequest.receiver_id),
        status: friendRequest.status,
        text: friendRequest.text,
        createdAt: friendRequest.createdAt,
        updatedAt: friendRequest.updatedAt,
    };
}

export function toFriendRequestPublicArray(friendRequests: friendDoc[]): FriendRequestPublicR[] {
    return friendRequests.map(toFriendRequestPublic);
}